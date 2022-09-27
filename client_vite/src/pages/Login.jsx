import axios from 'axios';
import React, { useState, useEffect } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
const Login = () => {
    const [content, setContent] = useState({
        content_name: '',
        content_detail: '',
        image: [],
        type: 0,
        date: new Date(),
        user: 'admin'
    });

    const handleChange = (e) => {
        const { content_name, content_detail, image, type, date, user } = e.target;
        if (e.target.name === 'image') {
            setContent({ ...content, [e.target.name]: e.target.files[0] });
            console.log(e.target.files[0])
        } else {
            setContent({ ...content, [e.target.name]: e.target.value });
        }
        console.log(content.image)
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('content_name', content.content_name);
        formData.append('content_detail', content.content_detail);
        formData.append('image', content.image);
        formData.append('date', content.date);
        formData.append('type', content.type);
        formData.append('user', content.user);
        // console.log(import.meta.env.REACT_APP_API)
        console.log(formData)
        axios({
            method: 'post',
            url: `http://172.16.255.137:4000/addcontent`,
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(function (response) {
                console.log(response);
            }).catch(function (response) {
                console.log(response)
            })

        // axios.post('http://localhost:4000',content)
        // .then(res=> console.log(res.data))
        // .catch(err=>console.log(err));
    }

    return (
        <div className='container'>
            <form encType='multipart/form-data' onSubmit={handleSubmit} >

                <label htmlFor="content_name">Content Name</label>
                <input type="text" name="content_name" className='form-control'
                    id="content_name" onChange={handleChange}
                />
                <label htmlFor="image">Main Image</label>
                <input type="file" name="image" className='form-control' id="image"
                    onChange={handleChange}
                />

                <CKEditor
                    editor={ClassicEditor}
                    data="<p>Hello from CKEditor 5!</p>"
                    onReady={editor => {
                        // You can store the "editor" and use when it is needed.
                        console.log('Editor is ready to use!', editor);
                    }}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        console.log({ event, editor, data });
                    }}
                    onBlur={(event, editor) => {
                        console.log('Blur.', editor);
                    }}
                    onFocus={(event, editor) => {
                        console.log('Focus.', editor);
                    }}
                />

                {/* ทดสอบการปิดใช้ Ckeditor แทน */}
                {/* <textarea 
            name="content_detail" 
            id="conten_detail" 
            cols="30" rows="10"
            className="form-control"
            onChange={handleChange}
            
            >

            </textarea> */}
                <div>
                    <button className="btn btn-outline-dark mt-2" type="submit">Submit</button>
                </div>
            </form>

        </div>
    )
}

export default Login