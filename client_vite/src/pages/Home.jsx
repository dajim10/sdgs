import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Slide from './Slide'
import './Home.css'


const Home = () => {
    const [content, setContent] = useState([]);

    const server = import.meta.env.REACT_APP_API

    useEffect(() => {
        console.log(import.meta.env.REACT_APP_API)
        axios.get(`http://172.16.255.137:4000/content`)
            .then(res => setContent(res.data))
            .catch(err => console.log(err));
    }, [])

    
    return (
        <>
        {server}
            <Slide />
            <div className="row">
                {content.map((item, idx) => (
                    <div className='col-lg-3 col-md-6 col-sm mt-2' key={item.id}>

                        <div className="card shadow mx-auto h-100">
                            <div className='inner'>
                                <img src={item.image}  alt="..." className='card-img-top'
                                    style={{
                                        borderTopRightRadius: '5px'
                                        , borderTopLeftRadius: '5px'
                                    }} />
                            </div>

                            <div className="card-body">
                                <div className="card-title">
                                    <h5>{item.content_name}</h5>
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </>
    )
}

export default Home