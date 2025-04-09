import './App.css'
import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
function ZaloRegister() {
   const [phone, setPhone] = useState('');
  return (
    <div className="zalo-container">
      <div className="zalo-box">
        <h1 className="zalo-title">Zalo</h1>
        <p className="zalo-subtitle">
          Tạo tài khoản Zalo để kết nối với bạn bè và gia đình
        </p>

        <PhoneInput
          country={'vn'}
          value={phone}
          onChange={setPhone}
          inputStyle={{ width: '100%' }}
          containerStyle={{ marginBottom: '12px' }}
        />
        <input type="password" placeholder="Mật khẩu" className="zalo-input" />
        <input type="password" placeholder="Nhập lại mật khẩu" className="zalo-input" />

        <button className="zalo-button">Đăng ký</button>

        <div className="zalo-links">
          <Link to="/" className="zalo-link blue">Đã có tài khoản? Đăng nhập</Link>
        </div>

        <div className="zalo-footer">
          <strong>Lưu ý bảo mật:</strong>
          <p>Vui lòng sử dụng số điện thoại thật để đảm bảo an toàn tài khoản và dễ dàng khôi phục khi cần.</p>
        </div>
      </div>
    </div>
  )
}

export default ZaloRegister
