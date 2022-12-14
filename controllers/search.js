const { response } = require('express');
const { ObjectId } = require('mongoose').Types;

const { User, Category, Product } = require('../models');

//añado todas las colecciones válidas
const collectionsPermission = [
    'users',
    'categories',
    'products',
    'roles'
];

const searchUsers = async( termino = '', res = response ) => {

    const isMongoID = ObjectId.isValid( termino ); // TRUE 

    if ( isMongoID ) {
        const user = await User.findById(termino);
        return res.json({
            results: ( user ) ? [ user ] : []
            // si el usuario existe voy a retornar el arreglo con el usuario, caso contrario
            //voy a regresar un usuario vacio [].
        });
    }
      //expresion regular, la mandamos en vez del termino.
    const regex = new RegExp( termino, 'i' );
    const users = await User.find({
        $or: [{ name: regex }, { email: regex }], //el nombre y el email conincida con esa expresion.
        $and: [{ status: true }] //para que en  la busqueda aparezca solo los que no han sido borrados.
    });

    res.json({
        results: users
    });
}

const searchCategories = async( termino = '', res = response ) => {

    const isMongoID = ObjectId.isValid( termino ); // TRUE 

    if ( isMongoID ) {
        const category = await Category.findById(termino);
        return res.json({
            results: ( category ) ? [ category ] : []
        });
    }

    const regex = new RegExp( termino, 'i' );
    const categories = await Category.find({ name: regex, status: true });

    res.json({
        results: categories
    });
}

const searchProducts = async( termino = '', res = response ) => {

    const isMongoID = ObjectId.isValid( termino ); // TRUE 

    if ( isMongoID ) {
        const product = await Product.findById(termino)
                            .populate('category','name');
        return res.json({
            results: ( product ) ? [ product ] : []
        });
    }

    const regex = new RegExp( termino, 'i' );
    const products = await Product.find({ name: regex, status: true })
                            .populate('category','name')
    res.json({
        results: products
    });

}


const search = ( req, res = response ) => {
    
    const { collection, termino  } = req.params;

    if ( !collectionsPermission.includes( collection ) ) {
        return res.status(400).json({
            msg: `allowed collections are: ${ collectionsPermission }`
        })
    }

    switch (collection) {
        case 'users':
            searchUsers(termino, res);
        break;
        case 'categories':
            searchCategories(termino, res);
        break;
        case 'products':
            searchProducts(termino, res);
        break;

        default:
            res.status(500).json({
                msg: 'Forgot to do this search'
            })
    }

}

module.exports = {
    search
}