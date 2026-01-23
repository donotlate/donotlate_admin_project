import React from 'react';
import "../css/AdminPage.css"; 
import { FaUserPlus, FaFileExport, FaUsers, FaUserCheck, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaUserXmark, FaUserGroup } from "react-icons/fa6";
import { IoMegaphoneSharp, IoSearch } from "react-icons/io5";

const AdminPage = () => {
  return (
    <div className="admin-root">
      {/* 1. GNB: 좌측 끝 로고/메뉴 - 우측 끝 프로필 */}
      <header className="gnb">
        <div className="gnb-left">
          <h1 className="logo">관리자 페이지</h1>
          <nav className="nav-menu">
            <span className="nav-item"><IoMegaphoneSharp /> 공지사항</span>
            <span className="nav-item active"><FaUserGroup /> 유저 관리</span>
          </nav>
        </div>
        <div className="gnb-right">
          <div className="admin-profile">
            <span>관리자</span>
            <div className="avatar"></div>
          </div>
        </div>
      </header>

      {/* 2. 메인 영역 */}
      <main className="main-content">
        
        {/* 공지사항 섹션 */}
        <section className="card-section">
          <div className="card-header">
            <div className="header-txt">
              <h3>공지사항</h3>
              <p>사이트 전체 공지사항을 관리합니다.</p>
            </div>
            <button className="btn-blue">+ 새 공지사항</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>상태</th>
                <th style={{ textAlign: 'right' }}>작업</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="notice-title"><span className="pin">📍</span> 서비스 점검 안내</td>
                <td>관리자</td>
                <td>2024.01.15</td>
                <td><span className="badge success">게시중</span></td>
                <td className="actions"><FaEdit /><FaTrash /></td>
              </tr>
              {/* 추가 데이터는 생략 */}
            </tbody>
          </table>
        </section>

        {/* 유저 관리 섹션 */}
        <section className="card-section">
          <div className="card-header">
            <div className="header-txt">
              <h3>유저 관리</h3>
              <p>등록된 사용자들을 관리하고 권한을 설정합니다.</p>
            </div>
            <div className="btn-group">
              <button className="btn-white"><FaFileExport /> 내보내기</button>
              <button className="btn-blue"><FaUserPlus /> 새 유저 추가</button>
            </div>
          </div>

          {/* 통계 카드: 그리드 4칸 */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info"><span>전체 유저</span><h2>1,234</h2></div>
              <div className="stat-icon icon-blue"><FaUsers /></div>
            </div>
            <div className="stat-card">
              <div className="stat-info"><span>활성 유저</span><h2>1,089</h2></div>
              <div className="stat-icon icon-green"><FaUserCheck /></div>
            </div>
            <div className="stat-card">
              <div className="stat-info"><span>신규 유저</span><h2>156</h2><small>30일</small></div>
              <div className="stat-icon icon-purple"><FaUserPlus /></div>
            </div>
            <div className="stat-card">
              <div className="stat-info"><span>비활성 유저</span><h2>145</h2></div>
              <div className="stat-icon icon-red"><FaUserXmark /></div>
            </div>
          </div>

          {/* 필터 탭 & 검색 */}
          <div className="toolbar">
            <div className="tabs">
              <button className="active">전체</button>
              <button>활성</button>
              <button>비활성</button>
              <button>일반</button>
              <button>관리자</button>
            </div>
            <div className="search-box">
              <IoSearch />
              <input type="text" placeholder="유저 검색..." />
            </div>
          </div>

          {/* 유저 테이블: 좌측 정렬 및 간격 복구 */}
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><input type="checkbox" /></th>
                <th style={{ width: '25%' }}>사용자 정보</th>
                <th style={{ width: '30%' }}>이메일 주소</th>
                <th>권한</th>
                <th>가입일</th>
                <th>상태</th>
                <th style={{ textAlign: 'right' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td><input type="checkbox" /></td>
                  <td className="user-profile">
                    <div className="user-avatar-placeholder"></div>
                    <div>
                      <div className="name">김민준 {i}</div>
                      <div className="uid">ID: 1000{i}</div>
                    </div>
                  </td>
                  <td className="email-cell">minjun.kim@example.com</td>
                  <td><span className="badge-role">일반</span></td>
                  <td>2024.01.15</td>
                  <td><span className="dot-active">● 활성</span></td>
                  <td className="actions"><FaEdit /><FaTrash /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 하단 페이지네이션 */}
          <div className="pagination">
            <span className="total">1-5 / 1,234명 표시</span>
            <div className="page-btns">
              <button className="p-nav"><FaChevronLeft /></button>
              <button className="p-num active">1</button>
              <button className="p-num">2</button>
              <button className="p-num">3</button>
              <button className="p-nav"><FaChevronRight /></button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;