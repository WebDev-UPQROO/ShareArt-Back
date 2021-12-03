const cloudinary = require('cloudinary').v2;

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
        cloudinary.uploader.upload(file, options).then(response => {
            resolve({
                id: response.public_id,
                url: response.secure_url
            })
        })
    })

};

exports.delete = (resources) => {
    cloudinary.api.delete_resources(resources).then(res => console.log(res));
}

exports.deleteFolder = (folder) => {
    cloudinary.api.delete_folder(folder).then(res => console.log(res));
}
