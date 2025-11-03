import mongoose from 'mongoose';

const uri = "mongodb+srv://M2Token_db:M2Token123@cluster0.cgsdft1.mongodb.net/m2token_db?retryWrites=true&w=majority&appName=Cluster0";

console.log("🧠 Intentando conectar a MongoDB Atlas...");

mongoose.connect(uri)
  .then(() => {
    console.log("✅ Conectado correctamente a MongoDB!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Error al conectar:", err.message);
    process.exit(1);
  });
