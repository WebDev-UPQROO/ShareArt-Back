const cloudinary = require('cloudinary');
require('dotenv').config();

cloudinary.v2.config({
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
        cloudinary.uploader.upload(file, options).then(response => {
            console.log(response);
            resolve({
                id: response.public_id,
                url: response.secure_url
            })
        })
    })

};

exports.delete = (image_id) => {
    cloudinary.uploader.destroy(image_id)
}
