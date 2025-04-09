
import './App.css'
import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
function ZaloLogin() {
  const [phone, setPhone] = useState('');
  return (
    <div className="zalo-container">
      <div className="zalo-box">
        <h1 className="zalo-title">Zalo</h1>
        <p className="zalo-subtitle">
          Đăng nhập tài khoản Zalo để kết nối với ứng dụng Zalo Web
        </p>

       <PhoneInput
        country={'vn'}
        value={phone}
        onChange={setPhone}
        inputStyle={{ width: '100%' }}
        containerStyle={{ marginBottom: '12px' }}
      />
        <input type="password" placeholder="Mật khẩu" className="zalo-input" />

        <button className="zalo-button">Đăng nhập với mật khẩu</button>

        <div className="zalo-links">
          <a href="#" className="zalo-link">Quên mật khẩu</a>
          <Link to="/register" className="zalo-link blue">Tạo tài khoản</Link>
        </div>

        <div className="zalo-footer">
          <strong>Nâng cao hiệu quả công việc với <span className="blue">Zalo PC</span></strong>
          <p>Gửi file lớn lên đến 1 GB, chụp màn hình, gọi video và nhiều tiện ích hơn nữa</p>
        </div>
      </div>
    </div>
  )
}

export default ZaloLogin
