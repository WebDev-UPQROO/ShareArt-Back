const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

exports.upload = (file, folder, id) => {
    let options;

    if (id != null)
        options = {
            public_id: id,
            folder: folder,
            resource_type: 'auto',
            overwrite: true,
        }
    else
        options = {
            folder: folder,
            resource_type: 'auto'
        }

    return new Promise(resolve => {
        console.log("entro a la promesa")
        cloudinary.uploader.upload(file, options).then(response =>
            resolve({
            id: response.public_id,
            url: response.secure_url
        }))
        console.log("salgo de la promesa")
    })

};

exports.delete = (image_id) => {
    cloudinary.uploader.destroy(image_id)
}
