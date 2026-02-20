import React, { useEffect, useState } from "react";
import "../css/AdminPage.css";
import { FaUserPlus, FaFileExport, FaUsers, FaUserCheck, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaSignOutAlt } from "react-icons/fa";
import { FaUserXmark, FaUserGroup } from "react-icons/fa6";
import { IoMegaphoneSharp, IoSearch } from "react-icons/io5";
import { AuthContext } from './AuthContext';
import { useContext } from "react";
import { useMemo } from "react"; // “계산 결과를 기억해두는 React 훅”
import { axiosAPI } from "../api/axiosAPI";

const AdminPage = () => {


  const globalState = useContext(AuthContext);

  // --- 유저 ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
  const [users, setUsers] = useState([]);

  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const nameExp = /^[가-힣a-zA-Z]{2,10}$/;

  const emailExp = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


  // --- 유저 조회 ---
  useEffect(()=>{
    
    const getUsers = async()=>{
      try{
        const resp = await axiosAPI.get("/admin/users");
  
          if(resp.status === 200){
            setUsers(resp.data);
          }
      }catch(error){
        console.log("회원조회 실패" , error);
      }
    }
    getUsers();
  },[]); 

// --- 유저 정보 수정 ---
const editUser = async (user) => {

    if(!nameExp.test(user.memberName)){
    alert("이름 형식이 올바르지 않습니다.");
    return;
  }

  if(!emailExp.test(user.memberEmail)){
    alert("이메일 형식이 올바르지 않습니다.");
    return;
  }
  try {
    const resp = await axiosAPI.put("/admin/editUser",user
    );
    return resp;
  } catch (error) {
    console.log("회원 수정 실패", error);
  }
};

// --- 유저 삭제 ---
const removeUser = async(memberNo)=>{

  const ok = window.confirm("정말 삭제하시겠습니까?");
  if (!ok) return;

  try {
    const resp = await axiosAPI.delete("/admin/removeUser",{
        params: { memberNo }
    });

    console.log("삭제 후 조회 응답:", resp.data);
    console.log("타입:", Array.isArray(resp.data));
    if(resp.status === 200){
      setUsers(resp.data);
      
    }
    
  }catch(error){
    console.log("회원 삭제 실패" , error);
  }
};

// --- 유저 추가 ---
const createUser = async(user)=>{

  try{
      const resp = await axiosAPI.post("/admin/createUser",user);

    console.log("회원 추가 응답:", resp.data);
    if(resp.status === 200){
      setUsers(resp.data);
    }

  }catch(error){
    console.log("회원 추가 실패" , error);
  }
};


  // --- 유저 수 조회 ---

const userStats = useMemo(() => {
  const now = new Date();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  return {
    all: users.length,
    active: users.filter(u => u.memberDelFl === 'N').length,
    inactive: users.filter(u => u.memberDelFl === 'Y').length,
    recent: users.filter(
      u => now - new Date(u.enrollDate) <= THIRTY_DAYS
    ).length
  };
}, [users]); // 바뀔 때만 재계산



// 게시판 ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  const [notices, setNotices] = useState([]);
  const [noticePage, setNoticePage] = useState(1);
  const noticesPerPage = 5;


// --- 게시판 조회 ---
useEffect(() => {

  const getNotices = async () => {
    try {
      const resp = await axiosAPI.get("/admin/notices");

      if (resp.status === 200) {
        setNotices(resp.data);
      }
    } catch (error) {
      console.log("게시판 조회 실패", error);
    }
  };

  getNotices();
}, []);

// --- 게시판 생성 ( formData ) 이미지는 json 형태로 못 보냄---
const createBoard = async (notice) => {
  try {
    const formData = new FormData();
    formData.append("boardTitle", notice.boardTitle);
    formData.append("boardContent", notice.boardContent);
    formData.append("boardDelFl", notice.boardDelFl);

    if (noticeImageFile) formData.append("image", noticeImageFile);

    console.log("title:", formData.get("boardTitle"));
    console.log("image:", formData.get("image")); // File 객체가 찍혀야 정상

    const resp = await axiosAPI.post("/admin/createBoard", formData); 

    if (resp.status === 200) {
      setNotices(resp.data);
    }
  } catch (error) {
    console.log("게시글 추가 실패", error);
  }
};

// --- 게시판 삭제 ---

const removeBoard = async(boardNo)=>{

  const ok = window.confirm("정말 삭제하시겠습니까?");
  if (!ok) return;

  try{
    const resp = await axiosAPI.delete("/admin/removeBoard",{   params: { boardNo } });

    if (resp.status === 200) {
      setNotices(resp.data);
    }
  }catch(error){
    console.log("게시판 삭제 실패",error);
  }
}

// --- 게시판 수정  ---
const editBoard = async (notice) => {
  try {
    const formData = new FormData();
    formData.append("boardNo", notice.boardNo);
    formData.append("boardTitle", notice.boardTitle);
    formData.append("boardContent", notice.boardContent);
    formData.append("boardDelFl", notice.boardDelFl);

    if (noticeImageFile) formData.append("image", noticeImageFile);

    const resp = await axiosAPI.put("/admin/editBoard", formData);

    if (resp.status === 200) {
      setNotices(resp.data);
    }
  } catch (error) {
    console.log("게시판 수정 실패", error);
  }
};


  // --- 프로필 ---
  const [imgError, setImgError] = useState(false);


  const hasProfileImg =
  globalState.loginMember?.profileImg &&
  globalState.loginMember.profileImg !== "null" &&
  !imgError;

  


  // --- 모달 상태 ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "user" or "notice"
  const [selectedItem, setSelectedItem] = useState(null);
  
  
  
  // --- 회원 필터 ---
  const filteredUsers = users
  .filter(u => {
    if (userFilter === "all") return true;
    if (userFilter === "active") return u.memberDelFl === 'N';
    if (userFilter === "inactive") return u.memberDelFl === 'Y';
    if (userFilter === "normal") return u.authority === 1; // 일반은 1
    if (userFilter === "admin") return u.authority === 3;  // 관리자는 3
    return true;
  })
  .filter(u => {
    const name = u.memberName || "";
    const keyword = userSearch || "";
    return name.toLowerCase().includes(keyword.toLowerCase());
  });
  
  // ---  회원 페이지네이션 계산 --- 
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const displayedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  
  
  
  
  // --- 공지 페이지네이션 계산 ---
  const totalNoticePages = Math.ceil(notices.length / noticesPerPage);
  const displayedNotices = notices.slice((noticePage - 1) * noticesPerPage,noticePage * noticesPerPage);
  
  // --- 이미지 ---
  const [noticeImageFile, setNoticeImageFile] = useState(null);      // 실제 업로드 파일
  const [noticeImagePreview, setNoticeImagePreview] = useState(null); // 미리보기

  const NOTICE_IMG_BASE = "http://localhost/images/board/";

  const previewSrc =
    noticeImagePreview ??
    (selectedItem?.thumbnailUrl
      ? `${NOTICE_IMG_BASE}${selectedItem.thumbnailUrl}`
      : null);


  // --- 모달 열기 ---
  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setModalOpen(true);

    if (type === "notice") {
    setNoticeImageFile(null);
    setNoticeImagePreview(null); 
  }
  };

  // --- 새 공지/유저 추가 ---
  const handleAddNotice = () => {
    setSelectedItem({
      boardTitle: "",
      boardContent: "",
      boardDelFl: "",
      boardViewCount : 0
      
    });
    setModalType("notice");
    setModalOpen(true);

    setNoticeImageFile(null);
    setNoticeImagePreview(null);
  };

  const handleAddUser = () => {
    setSelectedItem({  
    memberName: "",
    memberEmail: "",
    memberPw: "",
    authority: 1,       
    memberDelFl: "N",
    profileImg:""
    }); // 초기값 넣은 이유 : select가 보이기만 하고 값이 없음 , 즉 초기값을 넣어 값을 보내줌
    setModalType("user");
    setModalOpen(true);
  };


  // --- 모달 저장 ---
const saveChanges = async () => {
  if (modalType === "user") {

    const isCreate = !selectedItem.memberNo; // 수정 or 새 유저
    const regExp = /^[A-Za-z0-9!@#$%^&*]{8,15}$/;


    if (!selectedItem.memberName?.trim() || !selectedItem.memberEmail?.trim()) {
      alert("이름 또는 이메일을 입력해주세요");
      return;
    }

    if (isCreate && !selectedItem.memberPw?.trim()) {
      alert("비밀번호를 입력해주세요");
      return;
    }


    if (!nameExp.test(selectedItem.memberName)) {
      alert("이름 형식이 올바르지 않습니다.");
      return;
    }

    if (!emailExp.test(selectedItem.memberEmail)) {
      alert("이메일 형식이 올바르지 않습니다.");
      return;
    }

    if (isCreate && !regExp.test(selectedItem.memberPw)) {
      alert("비밀번호 형식이 올바르지 않습니다.");
      return;
    }

    if (isCreate) {
      await createUser(selectedItem);
      setUsers([...users, { ...selectedItem, memberNo: users.length + 1 }]);
    } else {
      await editUser(selectedItem);
      setUsers(
        users.map(u =>
          u.memberNo === selectedItem.memberNo ? selectedItem : u
        )
      );
    }

    setModalOpen(false);
  }else{
    const isCreate = !selectedItem.boardNo; 

    if(!selectedItem.boardTitle?.trim() || !selectedItem.boardContent?.trim()){
      alert("제목 또는 내용을 입력해 주세요");
      return;
    }
      if (isCreate) {
      await createBoard(selectedItem);
      setNotices([...notices, { ...selectedItem, boardNo: notices.length + 1 }]);
    } else {
      await editBoard(selectedItem);
      setNotices(notices.map(u =>u.boardNo === selectedItem.boardNo ? selectedItem : u
        )
      );
    }
    setModalOpen(false);
  }
};


  // --- 이미지 업로드 ---
const handleImageChange = (e) => {
  const file = e.target.files?.[0];
  console.log("file:", file); 
  if (!file) return;

  setNoticeImageFile(file);

  const blobUrl = URL.createObjectURL(file);
  setNoticeImagePreview(blobUrl);
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
        <span className="admin-name">{globalState.loginMember?.memberName} 관리자님</span>
        {/* 프로필 */}
      <div className="profile-avatar">
        {hasProfileImg ? (
          <img
            src={`${globalState.loginMember.profileImg}`}
            alt="프로필 이미지"
            className="avatar-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="avatar-initial">
            {globalState.loginMember?.memberName?.charAt(0) || "?"}
          </span>
        )}
      </div>
        
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
                <th>조회수</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {displayedNotices.map(notice => (
                <tr key={notice.boardNo}>
                  <td>{notice.boardTitle}</td>
                  <td>{notice.memberName} 님</td>
                  <td>{notice.boardWriteDate}</td>
                  <td>{notice.boardViewCount}</td>
                  <td>
                    <span 
                      className={notice.boardDelFl === "N" ? "badge-success" : "badge-draft"}
                      style={{ cursor: "pointer" }}
                    >
                      {notice.boardDelFl === "N" ? "게시중" : "임시저장"}
                    </span>
                  </td>
                  <td className="actions">
                    <FaEdit onClick={() => handleEdit(notice, "notice")} />
                    <FaTrash onClick={() => removeBoard(notice.boardNo)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* 공지사항 페이지네이션 */}
          <div className="pagination">
            <span>총 {notices.length}건 표시</span>
            <div className="page-btns">
              <button className="p-nav" disabled={noticePage===1} onClick={()=>setNoticePage(noticePage-1)}><FaChevronLeft /></button>
              {[...Array(totalNoticePages)].map((_, i) => (
                <button key={i} className={noticePage===i+1?"p-num active":"p-num"} onClick={()=>setNoticePage(i+1)}>{i+1}</button>
              ))}
              <button className="p-nav" disabled={noticePage===totalNoticePages} onClick={()=>setNoticePage(noticePage+1)}><FaChevronRight /></button>
            </div>
          </div>
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
                <h2>{userStats.all}</h2>
              </div>
              <div className="stat-icon icon-blue">
                <FaUsers />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <span>활성 유저</span>
                <h2>{userStats.active}</h2>
              </div>
              <div className="stat-icon icon-green">
                <FaUserCheck />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <span>비활성 유저</span>
                <h2>{userStats.inactive}</h2>
              </div>
              <div className="stat-icon icon-red">
                <FaUserXmark />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <span>최근 가입</span>
                <h2>{userStats.recent}</h2>
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
                <th>소셜</th>
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
                  <td>{user.socialType == null ? "LOCAL" : user.socialType}</td>
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
                    <FaTrash onClick={() => removeUser(user.memberNo)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>



          {/* 페이지네이션 */}
          <div className="pagination">
            <span>총 {filteredUsers.length}명 표시</span>
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
                  <h3>{selectedItem.memberNo ? "유저 수정" : "새 유저 추가"}</h3>
                  <label>이름</label>
                  <input value={selectedItem.memberName} onChange={e=>setSelectedItem({...selectedItem, memberName:e.target.value})}/>
                  <label>이메일</label>
                  <input value={selectedItem.memberEmail} onChange={e=>setSelectedItem({...selectedItem, memberEmail:e.target.value})}/>
                  {!selectedItem.memberNo ? (
                        <>
                          <label>비밀번호</label>
                          <input type="password"value={selectedItem.memberPw || ""} onChange={e => setSelectedItem({ ...selectedItem, memberPw: e.target.value })}
                          />
                        </>
                      ) 
                      : null
                    }
                  <label>권한</label>
                  <select value={selectedItem.authority} onChange={e=>setSelectedItem({...selectedItem, authority:Number(e.target.value)})}>
                    <option value={1}>일반</option>
                    <option value={3}>관리자</option>
                  </select>
                  <label>상태</label>
                  <select value={selectedItem.memberDelFl} onChange={e=>setSelectedItem({...selectedItem, memberDelFl:e.target.value})}>
                    <option value="N">활성</option>
                    <option value="Y">비활성</option>
                  </select>
                </>
              ) : (
                <>
                  <h3>{selectedItem.boardNo ? "공지사항 수정" : "새 공지사항 추가"}</h3>
                  <label>제목</label>
                  <input value={selectedItem.boardTitle} onChange={e=>setSelectedItem({...selectedItem, boardTitle:e.target.value})}/>
                  {selectedItem.boardNo?(
                    <>
                    <label>상태</label>
                   <select value={selectedItem.boardDelFl} onChange={e=>setSelectedItem({...selectedItem, boardDelFl:e.target.value})}>
                    <option value="N">게시중</option>
                    <option value="Y">임시 저장</option>
                  </select>
                    
                    </>
                  ) : null}
                  <label>이미지</label>
                  <input type="file" accept="image/*" onChange={handleImageChange}/>
                  {previewSrc && (
                  <img
                      src={previewSrc}
                      alt="미리보기"
                      style={{ width: "100%", marginTop: "10px", borderRadius: "8px" }}
                    />
                  )}
                  <label>내용</label>
                  <textarea value={selectedItem.boardContent} onChange={e=>setSelectedItem({...selectedItem, boardContent:e.target.value})}/>
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
