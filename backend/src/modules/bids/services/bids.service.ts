import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Bid, BidDocument, BidStatus } from '../models/bid.model';
import { CreateBidDto } from '../dtos/create-bid.dto';
import { Tender, TenderDocument, TenderStatus } from '../../tenders/models/tender.model';
import { AssignmentsService } from '../../project-assignments/services/assignments.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BidsService {
  constructor(
    @InjectModel(Bid.name) private bidModel: Model<BidDocument>,
    @InjectModel(Tender.name) private tenderModel: Model<TenderDocument>,
    private readonly assignmentsService: AssignmentsService,
    private eventEmitter: EventEmitter2
  ) {}

  async create(createBidDto: CreateBidDto, providerId: string): Promise<Bid> {
    const existingBid = await this.bidModel.findOne({ 
      tender: new Types.ObjectId(createBidDto.tender), 
      provider: new Types.ObjectId(providerId) 
    });

    if (existingBid) {
      throw new BadRequestException('Ya enviaste una propuesta para esta licitación');
    }

    const newBid = new this.bidModel({
      ...createBidDto,
      tender: new Types.ObjectId(createBidDto.tender),
      provider: new Types.ObjectId(providerId),
    });
    const savedBid = await newBid.save();

    const tender = await this.tenderModel.findById(createBidDto.tender).populate('project');
    const provider = await this.bidModel.db.model('users').findById(providerId).select('name razonSocial');

    if (tender) {
      this.eventEmitter.emit('bid.received', {
        companyId: tender.company.toString(),
        providerName: provider?.name || provider?.razonSocial || 'Un proveedor',
        projectName: (tender.project as any)?.name || 'Proyecto',
        tenderId: tender._id.toString(),
        projectId: (tender.project as any)?._id.toString()
      });
    }

    return savedBid;
  }

  async findByTender(tenderId: string): Promise<Bid[]> {
    return this.bidModel
      .find({ tender: new Types.ObjectId(tenderId) })
      .populate('provider', 'name email razonSocial phone')
      .sort({ amount: 1 }) 
      .exec();
  }

  async findByProvider(providerId: string): Promise<Bid[]> {
    return this.bidModel
      .find({ provider: new Types.ObjectId(providerId) })
      .populate({
        path: 'tender',
        populate: { path: 'project', select: 'name address' } 
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async adjudicate(bidId: string, companyId: string, userId: string) {
    const winningBid = await this.bidModel.findById(bidId);
    if (!winningBid) throw new NotFoundException('Postulación no encontrada');

    const tender = await this.tenderModel.findById(winningBid.tender).populate('project');
    if (!tender) throw new NotFoundException('Licitación no encontrada');

    if (tender.status !== TenderStatus.OPEN) {
      throw new BadRequestException('Esta licitación ya no está abierta para adjudicaciones');
    }

    winningBid.status = BidStatus.ACCEPTED;
    await winningBid.save();

    const rejectedBids = await this.bidModel.find({ tender: tender._id, _id: { $ne: winningBid._id } });

    await this.bidModel.updateMany(
      { tender: tender._id, _id: { $ne: winningBid._id } },
      { $set: { status: BidStatus.REJECTED } }
    );

    tender.status = TenderStatus.AWARDED;
    await tender.save();

    await this.assignmentsService.assignProvider(
      companyId, 
      {
        projectId: (tender.project as any)._id.toString(),
        providerId: winningBid.provider.toString(),
      }, 
      userId, 
      winningBid.amount
    );

    this.eventEmitter.emit('bid.awarded', {
      providerId: winningBid.provider.toString(),
      projectName: (tender.project as any)?.name || 'Proyecto',
      projectId: (tender.project as any)._id.toString()
    });

    rejectedBids.forEach(bid => {
      this.eventEmitter.emit('bid.rejected', {
        providerId: bid.provider.toString(),
        projectName: (tender.project as any)?.name || 'Proyecto'
      });
    });

    return { 
      success: true, 
      message: 'Proveedor adjudicado y asignado al proyecto exitosamente',
      tenderId: tender._id
    };
  }
}