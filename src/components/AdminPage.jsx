import React, { useEffect, useState } from "react";
import "../css/AdminPage.css";
import { FaUserPlus, FaFileExport, FaUsers, FaUserCheck, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaSignOutAlt } from "react-icons/fa";
import { FaUserXmark, FaUserGroup } from "react-icons/fa6";
import { IoMegaphoneSharp, IoSearch } from "react-icons/io5";
import { AuthContext } from './AuthContext';
import { useContext } from "react";
import axios from "axios";

const AdminPage = () => {
  
   const globalState = useContext(AuthContext);

  // --- 데이터 ---
  const [users, setUsers] = useState([]);

  // --- 유저 조회 ---
  useEffect(()=>{
    
    const getUsers = async()=>{
      const resp = await axios.get("http://localhost/admin/Users");
      try{
  
          if(resp.status === 200){
            setUsers(resp.data);
          }
      }catch(error){
        console.log("회원조회 실패" , error);
      }
    }

    getUsers();
  },[]); 

  const [notices, setNotices] = useState([
    { id: 1, title: "서비스 점검 안내", content: "서버 점검으로 인해 1시간 서비스 이용이 제한됩니다.", image: null, author: "관리자", date: "2024.01.15", status: "published" },
  ]);

  // --- 모달 상태 ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "user" or "notice"
  const [selectedItem, setSelectedItem] = useState(null);

  // --- 검색/필터/페이지 ---
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

 const filteredUsers = users
    .filter(u => {
      if (userFilter === "all") return true;
      if (userFilter === "active") return u.memberDelFl === 'N';
      if (userFilter === "inactive") return u.memberDelFl === 'Y';
      if (userFilter === "normal") return u.authority === 1; // 일반은 1
      if (userFilter === "admin") return u.authority === 3;  // 관리자는 3
      return true;
    })
    .filter(u => u.memberName.toLowerCase().includes(userSearch.toLowerCase())); // 유저 이름 검색 

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const displayedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  // --- 모달 열기 ---
  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setModalOpen(true);
  };

  // --- 새 공지/유저 추가 ---
  const handleAddNotice = () => {
    setSelectedItem({ title: "", content: "", image: null, author: "관리자", status: "draft", date: new Date().toISOString().split("T")[0] });
    setModalType("notice");
    setModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedItem({ memberName: "", memberEmail: "", authority: "일반", memberDelFl: "active", enrollDate:"" });
    setModalType("user");
    setModalOpen(true);
  };


  // --- 모달 저장 ---
  const saveChanges = () => {
    if(modalType === "user") {
      if(selectedItem.memberNo){ 
        setUsers(users.map(u => u.memberNo === selectedItem.memberNo ? selectedItem : u));
      } else { 
        setUsers([...users, { ...selectedItem, memberNo: users.length + 1 }]);
      }
    } else if(modalType === "notice") {
      if(selectedItem.id){ 
        setNotices(notices.map(n => n.id === selectedItem.id ? selectedItem : n));
      } else { 
        setNotices([...notices, { ...selectedItem, id: notices.length + 1 }]);
      }
    }
    setModalOpen(false);
  };

  // --- 이미지 업로드 ---
  const handleImageChange = e => {
    const file = e.target.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = () => setSelectedItem({...selectedItem, image: reader.result}); // onload : 다 읽으면 실행(이미지 미리보기 가능) , FileReader 사용 시 onload 필수
      reader.readAsDataURL(file); // Base64
    }
  };

  


  const moveTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (


  <div className="admin-root">
      <header className="gnb">
  <div className="gnb-inner">
      
    <div className="gnb-left">
      <h1 className="logo">관리자 페이지</h1>

    <nav className="nav-menu">
      <span className="nav-item" onClick={() => moveTo("notice")}>
        <IoMegaphoneSharp /> 공지사항
      </span>
      <span className="nav-item" onClick={() => moveTo("users")}>
        <FaUserGroup /> 유저 관리
      </span>
    </nav>

    </div>

    <div className="gnb-right">
      <div className="admin-profile">
        <span>관리자</span>
        <div className="avatar"></div>
      </div>

      <button className="btn-white" onClick={globalState.handleLogout}>
        <FaSignOutAlt /> 로그아웃
      </button>
    </div>
  </div>
</header>



      <main className="main-content">
        {/* 공지사항 */}
        <section className="card-section" id="notice">
          <div className="card-header">
            <div className="header-txt">
              <h3>공지사항</h3>
              <p>사이트 전체 공지사항을 관리합니다.</p>
            </div>
            <button className="btn-blue" onClick={handleAddNotice}>+ 새 공지사항</button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {notices.map(notice => (
                <tr key={notice.id}>
                  <td>{notice.title}</td>
                  <td>{notice.author}</td>
                  <td>{notice.date}</td>
                  <td>
                    <span 
                      className={notice.status === "published" ? "badge-success" : "badge-draft"}
                      style={{ cursor: "pointer" }}
                    >
                      {notice.status === "published" ? "게시중" : "임시저장"}
                    </span>
                  </td>
                  <td className="actions">
                    <FaEdit onClick={() => handleEdit(notice, "notice")} />
                    <FaTrash onClick={() => alert("공지 삭제 기능 구현 가능")} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 유저 요약 통계 섹션 */}
        <section className="card-section">
          <div className="card-header">
            <div className="header-txt">
              <h3>유저 현황 요약</h3>
              <p>전체 사용자 상태를 한눈에 확인합니다.</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info">
                <span>전체 유저</span>
                <h2>1,234</h2>
              </div>
              <div className="stat-icon icon-blue">
                <FaUsers />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <span>활성 유저</span>
                <h2>1,089</h2>
              </div>
              <div className="stat-icon icon-green">
                <FaUserCheck />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <span>비활성 유저</span>
                <h2>145</h2>
              </div>
              <div className="stat-icon icon-red">
                <FaUserXmark />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <span>최근 가입</span>
                <h2>156</h2>
                <small>최근 30일</small>
              </div>
              <div className="stat-icon icon-purple">
                <FaUserPlus />
              </div>
            </div>
          </div>
      </section>


        {/* 유저 관리 */}
        <section className="card-section" id="users">
          <div className="card-header">
            <div className="header-txt">
              <h3>유저 관리</h3>
              <p>등록된 사용자들을 관리하고 권한을 설정합니다.</p>
            </div>
            <div className="btn-group">
              <button className="btn-blue" onClick={handleAddUser}><FaUserPlus /> 새 유저 추가</button>
            </div>
          </div>

          {/* 필터 + 검색 */}
          <div className="toolbar">
            <div className="tabs">
              <button className={userFilter==="all"?"active":""} onClick={()=>{setUserFilter("all"); setCurrentPage(1)}}>전체</button>
              <button className={userFilter==="active"?"active":""} onClick={()=>{setUserFilter("active"); setCurrentPage(1)}}>활성</button>
              <button className={userFilter==="inactive"?"active":""} onClick={()=>{setUserFilter("inactive"); setCurrentPage(1)}}>비활성</button>
              <button className={userFilter==="normal"?"active":""} onClick={()=>{setUserFilter("normal"); setCurrentPage(1)}}>일반</button>
              <button className={userFilter==="admin"?"active":""} onClick={()=>{setUserFilter("admin"); setCurrentPage(1)}}>관리자</button>
            </div>
            <div className="search-box">
              <IoSearch />
              <input type="text" placeholder="유저 검색..." value={userSearch} onChange={e=>{setUserSearch(e.target.value); setCurrentPage(1)}} />
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>사용자 정보</th>
                <th>이메일</th>
                <th>권한</th>
                <th>가입일</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map(user => (
                <tr key={user.memberNo}>
                  <td>{user.memberName}</td>
                  <td>{user.memberEmail}</td>
                  <td>{user.authority === 3? "관리자": "일반"}</td>
                  <td>{user.enrollDate}</td>
                  <td>
                    <span 
                      className={user.memberDelFl == 'N' ? "dot-active" : "dot-inactive"}
                      style={{ cursor: "pointer" }}
                    >
                      {user.memberDelFl == 'N' ? "활성" : "비활성"}
                    </span>
                  </td>
                  <td className="actions">
                    <FaEdit onClick={() => handleEdit(user, "user")} />
                    <FaTrash onClick={() => alert("유저 삭제 기능 구현 가능")} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          <div className="pagination">
            <span>{(currentPage-1)*usersPerPage+1}-{Math.min(currentPage*usersPerPage, filteredUsers.length)} / {filteredUsers.length}명 표시</span>
            <div className="page-btns">
              <button className="p-nav" disabled={currentPage===1} onClick={()=>setCurrentPage(currentPage-1)}><FaChevronLeft /></button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} className={currentPage===i+1?"p-num active":"p-num"} onClick={()=>setCurrentPage(i+1)}>{i+1}</button>
              ))}
              <button className="p-nav" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(currentPage+1)}><FaChevronRight /></button>
            </div>
          </div>
        </section>

        {/* 모달 */}
        {modalOpen && (
          <div className="modal-backdrop">
            <div className="modal">
              {modalType==="user" ? (
                <>
                  <h3>{selectedItem.id ? "유저 수정" : "새 유저 추가"}</h3>
                  <label>이름:</label>
                  <input value={selectedItem.name} onChange={e=>setSelectedItem({...selectedItem, name:e.target.value})}/>
                  <label>이메일:</label>
                  <input value={selectedItem.email} onChange={e=>setSelectedItem({...selectedItem, email:e.target.value})}/>
                  <label>권한:</label>
                  <select value={selectedItem.role} onChange={e=>setSelectedItem({...selectedItem, role:e.target.value})}>
                    <option value="일반">일반</option>
                    <option value="관리자">관리자</option>
                  </select>
                  <label>상태:</label>
                  <select value={selectedItem.status} onChange={e=>setSelectedItem({...selectedItem, status:e.target.value})}>
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </select>
                </>
              ) : (
                <>
                  <h3>{selectedItem.id ? "공지사항 수정" : "새 공지사항 추가"}</h3>
                  <label>제목:</label>
                  <input value={selectedItem.title} onChange={e=>setSelectedItem({...selectedItem, title:e.target.value})}/>
                  <label>이미지:</label>
                  <input type="file" accept="image/*" onChange={handleImageChange}/>
                  {selectedItem.image && <img src={selectedItem.image} alt="미리보기" style={{ width: "100%", marginTop: "10px", borderRadius: "8px" }} />}
                  <label>내용:</label>
                  <textarea value={selectedItem.content} onChange={e=>setSelectedItem({...selectedItem, content:e.target.value})}/>
                </>
              )}
              <div className="modal-buttons">
                <button className="btn-white" onClick={()=>setModalOpen(false)}>취소</button>
                <button className="btn-blue" onClick={saveChanges}>저장</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};



export default AdminPage;
