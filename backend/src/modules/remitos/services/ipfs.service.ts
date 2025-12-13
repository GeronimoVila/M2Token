import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class IpfsService {
  async uploadFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    try {
      const formData = new FormData();
      
      const safeFileName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');

      console.log(`📤 Subiendo a Pinata: ${safeFileName} (${fileBuffer.length} bytes)`);

      formData.append('file', fileBuffer, { filename: safeFileName });
      
      const metadata = JSON.stringify({
        name: safeFileName,
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({ cidVersion: 1 });
      formData.append('pinataOptions', options);

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.PINATA_JWT}`,
            ...formData.getHeaders(),
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        },
      );

      console.log('✅ Éxito Pinata. Hash:', response.data.IpfsHash);
      return response.data.IpfsHash;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Error Axios Status:', error.response?.status);
        console.error('❌ Error Axios Data:', JSON.stringify(error.response?.data, null, 2));
      } else {
        console.error('❌ Error desconocido:', error);
      }
      
      throw new InternalServerErrorException('Fallo al subir evidencia a IPFS');
    }
  }
}