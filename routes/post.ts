import { Router, Response } from 'express';
import { verificaToken } from '../middlewares/autenticacion';
import { Post } from '../models/post.model';
import { FileUpload } from '../interfaces/file-upload';
import FileSystem from '../classes/file-system';


const postRoutes = Router();
const fileSystem = new FileSystem();

//Obtener Posts paginados

postRoutes.get('/', async(req:any, res: Response)=>{

    let pagina = Number(req.query.pagina) || 1;
    let skip = pagina - 1;
    skip = skip * 10;
    const posts = await Post.find()
                            .sort({_id: -1})
                            .limit(10)
                            .skip(skip)
                            .populate('usuario', '-password')
                            .exec();

    res.json({
        ok:true,
        pagina,
        posts
    });
});


//Crear Post

postRoutes.post('/', [verificaToken], (req: any, res: Response) => {

    const body = req.body;
    body.usuario = req.usuario._id;

    const imagenes = fileSystem.imagenesDeTempHaciaPosts(req.usuario._id);

    body.imgs = imagenes;

    Post.create(body).then(async postDB => {
        
        await postDB.populate('usuario', '-password').execPopulate();
        res.json({
            Ok:true,
            post: postDB
        })

    }).catch(err => {
        res.json(err)
    })


})

//Servicio para subir archivos

postRoutes.post('/upload', [verificaToken], async(req:any, res: Response)=>{


    if (!req.files) {
        return res.status(400).json({
            ok:false,
            mensaje: "No se subió ningun archivo"
        })
    }

    const file: FileUpload = req.files.image;

    if (!file) {
        return res.status(400).json({
            ok:false,
            mensaje: "No se subió ningun archivo--image"
        })
    }

    if (!file.mimetype.includes('image')) {
        return res.status(400).json({
            ok:false,
            mensaje: "Lo que subio no es una imágen"
        })
    }

    await fileSystem.guardarImagenTemporal(file, req.usuario._id);

    res.json({
        ok:true,
        file: file.mimetype
    });
});

//Obtener imagen por id

postRoutes.get('/imagen/:userid/:img', [verificaToken], async(req:any, res: Response)=>{
    const userId = req.params.userid;
    const img    = req.params.img;

    const pathFoto = fileSystem.getFotouRL(userId, img);

    res.sendFile( pathFoto );

});

export default postRoutes;