import {v2 as cloudinary} from 'cloudinary';

export const CloudinaryProvider = {
    provide:'CLOUDINARY',
    useFactory: () =>{
        return cloudinary.config(
            {
                cloud_name: 'dvqf8smev',
                api_key: '635562132924635',
                api_secret: 'r31WQh8N5_2OV3D54ria-l_AKeo'
            }
        )
    }
        
}