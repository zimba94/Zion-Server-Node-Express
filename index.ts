import Server from './classes/server';
import userRoutes from './routes/usuario';
import  mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import postRoutes from './routes/post';

const server = new Server();


//Body Parser

server.app.use( bodyParser.urlencoded({ extended: true}));
server.app.use( bodyParser.json() );

//FileUpload
server.app.use(fileUpload());

//Configurar el CORS

server.app.use(cors({origin: true, credentials: true}));

//Rutas de mi app

server.app.use('/user', userRoutes);
server.app.use('/posts', postRoutes);


//Conectar BD

mongoose.connect('mongodb://localhost:27017/zion',
                { useNewUrlParser: true, useCreateIndex: true}, (err) =>{
                    if( err ) throw err;
                    console.log("Base de Datos ONLINE");
                });

//Levantar Express

server.start(()=>{
    console.log(`Servidor corriendo en el puerto ${server.port}`);
})