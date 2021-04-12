import { FileUpload } from '../interfaces/file-upload';
import fs from 'fs';
import path from 'path';
import uniqid from 'uniqid';

export default class FileSystem{

    constructor(){}

    guardarImagenTemporal( file: FileUpload, userId: string){


        return new Promise<void>((resolve, reject)=>{
            //Crear carpetas
            const path = this.crearCarpetaUsuario(userId);
    
            //Nombre archivo
            const nombreArchivo = this.generarNombreUnico(file.name);
            
            //Pasar el archivo a la carpeta Temp
    
            file.mv(`${ path }/${ nombreArchivo }`, (err: any)=>{
                if (err) {
                    //No se pudo mover
                    reject(err);
                } else {
                    //Todo salió bien
                    resolve();
                }
            });
        });
        
        

    }

    private generarNombreUnico( nombreOriginal: string){

        const nombreArr = nombreOriginal.split('.');
        const extension = nombreArr[nombreArr.length - 1];

        const idUnico = uniqid();

        return `${idUnico}.${extension}`;

    }    

    private crearCarpetaUsuario(userId: string){
        const pathUser = path.resolve( __dirname, '../uploads', userId );
        const pathUserTemp = pathUser + '/temp' ;

        const existe = fs.existsSync(pathUser);

        if (!existe) {
            fs.mkdirSync( pathUser );
            fs.mkdirSync( pathUserTemp );
        }

        return pathUserTemp;


    }

    imagenesDeTempHaciaPosts(userId: string){
        const pathTemp = path.resolve(__dirname, '../uploads', userId, 'temp');
        const pathPost = path.resolve(__dirname, '../uploads', userId, 'posts');

        if (!fs.existsSync(pathTemp)) {
            return [];
        }

        if (!fs.existsSync(pathPost)) {
            fs.mkdirSync( pathPost );
        }

        const imagenesTemp = this.obtenerImagenesEnTemp(userId);

        imagenesTemp.forEach(imagen => {
            fs.renameSync(`${pathTemp}/${imagen}`, `${pathPost}/${imagen}`);
        });

        return imagenesTemp;
        
    }

    private obtenerImagenesEnTemp( userId: string){

        const pathTemp = path.resolve(__dirname, '../uploads/', userId, 'temp');

        return fs.readdirSync(pathTemp) || [];

    }

    getFotouRL(userId: string, img: string){
        const pathFoto = path.resolve(__dirname, '../uploads', userId, 'posts', img);
        
        if (!fs.existsSync(pathFoto)) {
            return path.resolve(__dirname, '../assets/400x250.jpg');
        }

        return pathFoto;
    }
}