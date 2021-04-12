import {Router, Request, Response} from 'express';
import { Usuario } from '../models/usuario.model';
import bcrypt from 'bcrypt';
import Token from '../classes/token';
import { verificaToken } from '../middlewares/autenticacion';

const userRoutes = Router();

//Login
userRoutes.post('/login', (req: Request, res: Response)=>{
    const body = req.body;
    Usuario.findOne({email: body.email}, (err: any, userDB: any) => {
        if (err) throw err;
        if (!userDB) {
            return res.json({
                ok:false,
                mensaje: 'Usuario/Contraseña no son correctos'
            })
        }

        if (userDB.compararPassword(body.password)) {
            const tokenUser = Token.getJwtToken({
                _id: userDB._id,
                nombre: userDB.nombre,
                email: userDB.email,
                password: userDB.password,
                avatar: userDB.avatar,
                telefono: userDB.telefono
            })
            res.json({
                ok: true,
                token:tokenUser
            })
        }else{
            return res.json({
                ok:false,
                mensaje: 'Usuario/Contraseña no son correctos ***'
            })
        }
    })
});


//Crear un usuario
userRoutes.post('/create', (req: Request, res: Response) => {

    const user = {
        nombre   : req.body.nombre,
        avatar   : req.body.avatar,
        email    : req.body.email,
        password : bcrypt.hashSync(req.body.password, 10),
        telefono : req.body.telefono   
    };

    Usuario.create( user ).then( userDB =>{

        const tokenUser = Token.getJwtToken({
            _id: userDB._id,
            nombre: userDB.nombre,
            email: userDB.email,
            avatar: userDB.avatar,
            telefono: userDB.telefono
        })
        res.json({
            ok: true,
            token:tokenUser
        })
    }).catch(err => {
        res.json({
            ok: false,
            err
        });
    });
    
});

//Atualizar un usuario
userRoutes.post('/update', verificaToken ,(req: any, res: Response) => {
    
    const user = {
        nombre   : req.body.nombre   || req.usuario.nombre,
        avatar   : req.body.avatar   || req.usuario.avatar,
        email    : req.body.email    || req.usuario.email,
        password : req.body.password || req.usuario.password,
        telefono : req.body.telefono || req.usuario.telefono   
    };
    if (req.body.password) {
        user.password = bcrypt.hashSync(user.password, 10);
    }
    Usuario.findByIdAndUpdate(req.usuario._id, user, {new:true}, (err, userDB)=>{
        if(err) throw err;
        if (!userDB) {
            return res.json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID'
            });
        }

        const tokenUser = Token.getJwtToken({
            _id: userDB._id,
            nombre: userDB.nombre,
            email: userDB.email,
            password: userDB.password,
            avatar: userDB.avatar,
            telefono: userDB.telefono
        })
        res.json({
            ok: true,
            token:tokenUser
        })
        
    });
});

userRoutes.get('/', [verificaToken], (req: any, res: Response)=>{

    const usuario = req.usuario;

    res.json({
        ok: true,
        usuario
    });
});


export default userRoutes;
