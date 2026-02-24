import React, { useEffect, useState, useContext, useMemo } from "react";
import "../css/AdminPage.css";
import {
  FaUserPlus,
  FaUsers,
  FaUserCheck,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
} from "react-icons/fa";
import { FaUserXmark, FaUserGroup } from "react-icons/fa6";
import { IoMegaphoneSharp, IoSearch } from "react-icons/io5";
import { AuthContext } from "./AuthContext";
import { axiosAPI } from "../api/axiosAPI";

/**
 *  이미지 경로 처리 (배포/로컬 모두 OK)
 * - thumbnailUrl이 파일명만(uuid.webp) / /images/board/uuid.webp / http(s)://... / blob:...
 * 어떤 형태든 최종 img src로 변환
 */
const API_BASE_URL = axiosAPI.defaults.baseURL || window.location.origin;

const API_ORIGIN = (() => {
  try {
    // ex) https://donotlate.kro.kr  또는  http://localhost:8080
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL;
  }
})();

const resolveImgSrc = (thumbnailUrl) => {
  if (!thumbnailUrl || thumbnailUrl === "null") return null;

  // 미리보기 blob URL이면 그대로 사용
  if (thumbnailUrl.startsWith("blob:")) return thumbnailUrl;

  // 절대 URL이면 그대로 사용
  if (thumbnailUrl.startsWith("http")) return thumbnailUrl;

  // /images/... 형태면 백엔드 origin 붙이기
  if (thumbnailUrl.startsWith("/")) return `${API_ORIGIN}${thumbnailUrl}`;

  // 파일명만 있으면 /images/board/ 붙이기
  return `${API_ORIGIN}/images/board/${thumbnailUrl}`;
};

const AdminPage = () => {
  const globalState = useContext(AuthContext);

  // =========================
  // 유저
  // =========================
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const nameExp = /^[가-힣a-zA-Z]{2,10}$/;
  const emailExp = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  // --- 유저 조회 ---
  useEffect(() => {
    const getUsers = async () => {
      try {
        const resp = await axiosAPI.get("/admin/users");
        if (resp.status === 200) setUsers(resp.data);
      } catch (error) {
        console.log("회원조회 실패", error);
      }
    };
    getUsers();
  }, []);

  // --- 유저 수정 ---
  const editUser = async (user) => {
    if (!nameExp.test(user.memberName)) {
      alert("이름 형식이 올바르지 않습니다.");
      return;
    }
    if (!emailExp.test(user.memberEmail)) {
      alert("이메일 형식이 올바르지 않습니다.");
      return;
    }

    try {
      const resp = await axiosAPI.put("/admin/editUser", user);
      if (resp.status === 200) setUsers(resp.data);
      return resp;
    } catch (error) {
      console.log("회원 수정 실패", error);
    }
  };

  // --- 유저 삭제 ---
  const removeUser = async (memberNo) => {
    const ok = window.confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    try {
      const resp = await axiosAPI.delete("/admin/removeUser", {
        params: { memberNo },
      });
      if (resp.status === 200) setUsers(resp.data);
    } catch (error) {
      console.log("회원 삭제 실패", error);
    }
  };

  // --- 유저 생성 ---
  const createUser = async (user) => {
    try {
      const resp = await axiosAPI.post("/admin/createUser", user);
      if (resp.status === 200) setUsers(resp.data);
    } catch (error) {
      console.log("회원 추가 실패", error);
    }
  };

  // --- 유저 통계(메모이제이션) ---
  const userStats = useMemo(() => {
    const now = new Date();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    return {
      all: users.length,
      active: users.filter((u) => u.memberDelFl === "N").length,
      inactive: users.filter((u) => u.memberDelFl === "Y").length,
      recent: users.filter((u) => now - new Date(u.enrollDate) <= THIRTY_DAYS)
        .length,
    };
  }, [users]);

  // --- 유저 필터 + 검색 ---
  const filteredUsers = users
    .filter((u) => {
      if (userFilter === "all") return true;
      if (userFilter === "active") return u.memberDelFl === "N";
      if (userFilter === "inactive") return u.memberDelFl === "Y";
      if (userFilter === "normal") return u.authority === 1;
      if (userFilter === "admin") return u.authority === 3;
      return true;
    })
    .filter((u) => {
      const name = u.memberName || "";
      const keyword = userSearch || "";
      return name.toLowerCase().includes(keyword.toLowerCase());
    });

  // --- 유저 페이지네이션 ---
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // =========================
  // 공지사항(게시판)
  // =========================
  const [notices, setNotices] = useState([]);
  const [noticePage, setNoticePage] = useState(1);
  const noticesPerPage = 5;

  //  공지 필터
  const [noticeSearch, setNoticeSearch] = useState("");
  const [noticeStatusFilter, setNoticeStatusFilter] = useState("all"); 
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState("all"); 

  // --- 공지 조회 ---
  const getNotices = async () => {
    try {
      const resp = await axiosAPI.get("/admin/notices");
      if (resp.status === 200) setNotices(resp.data);
    } catch (error) {
      console.log("게시판 조회 실패", error);
    }
  };

  useEffect(() => {
    getNotices();
  }, []);

  // --- 이미지(공지) ---
  const [noticeImageFile, setNoticeImageFile] = useState(null);
  const [noticeImagePreview, setNoticeImagePreview] = useState(null);

  // --- 모달 상태 ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "user" | "notice"
  const [selectedItem, setSelectedItem] = useState(null);

  //  미리보기: 새로 올린 이미지가 있으면 그걸 우선, 없으면 기존 thumbnailUrl
  const previewSrc =
    noticeImagePreview ?? resolveImgSrc(selectedItem?.thumbnailUrl);

  // --- 게시글 생성 ---
  const createBoard = async (notice) => {
    try {
      const formData = new FormData();
      formData.append("boardTitle", notice.boardTitle);
      formData.append("boardContent", notice.boardContent);
      formData.append("boardDelFl", notice.boardDelFl);
      formData.append("categoryNo", notice.categoryNo);

      if (noticeImageFile) formData.append("image", noticeImageFile);

      const resp = await axiosAPI.post("/admin/createBoard", formData);

      if (resp.status === 200) {
        setNotices(resp.data);
        setNoticeImageFile(null);
        setNoticeImagePreview(null);
      }
    } catch (error) {
      console.log("게시글 추가 실패", error);
    }
  };

  // --- 게시글 삭제 ---
  const removeBoard = async (boardNo) => {
    const ok = window.confirm("정말 삭제하시겠습니까?");
    if (!ok) return;

    try {
      const resp = await axiosAPI.delete("/admin/removeBoard", {
        params: { boardNo },
      });
      if (resp.status === 200) setNotices(resp.data);
    } catch (error) {
      console.log("게시판 삭제 실패", error);
    }
  };

  // --- 게시글 수정 ---
  const editBoard = async (notice) => {
    try {
      const formData = new FormData();
      formData.append("boardNo", notice.boardNo);
      formData.append("boardTitle", notice.boardTitle);
      formData.append("boardContent", notice.boardContent);
      formData.append("boardDelFl", notice.boardDelFl);
      formData.append("categoryNo", notice.categoryNo);

      if (noticeImageFile) formData.append("image", noticeImageFile);

      const resp = await axiosAPI.put("/admin/editBoard", formData);

      if (resp.status === 200) {
        setNotices(resp.data);
        setNoticeImageFile(null);
        setNoticeImagePreview(null);
      }
    } catch (error) {
      console.log("게시판 수정 실패", error);
    }
  };

  //  공지 필터/검색 적용 
  const filteredNotices = notices
    .filter((n) => {
      // 상태 필터 
      if (noticeStatusFilter === "all") return true;
      return n.boardDelFl === noticeStatusFilter;
    })
    .filter((n) => {
      // 카테고리 필터
      if (noticeCategoryFilter === "all") return true;
      return Number(n.categoryNo) === Number(noticeCategoryFilter);
    })
    .filter((n) => {
      // 제목 검색
      const title = n.boardTitle || "";
      const keyword = noticeSearch || "";
      return title.toLowerCase().includes(keyword.toLowerCase());
    });

 
  const totalNoticePages = Math.ceil(filteredNotices.length / noticesPerPage);
  const displayedNotices = filteredNotices.slice(
    (noticePage - 1) * noticesPerPage,
    noticePage * noticesPerPage
  );

  // =========================
  // 프로필(상단)
  // =========================
  const [imgError, setImgError] = useState(false);

  const hasProfileImg =
    globalState.loginMember?.profileImg &&
    globalState.loginMember.profileImg !== "null" &&
    !imgError;

  // =========================
  // 공통 핸들러
  // =========================
  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setModalOpen(true);

    // ✅ 공지 수정 모달 열 때, 이전 선택 이미지 초기화
    if (type === "notice") {
      setNoticeImageFile(null);
      setNoticeImagePreview(null);
    }
  };

  const handleAddNotice = () => {
    setSelectedItem({
      boardTitle: "",
      boardContent: "",
      boardDelFl: "N", // ✅ 기본값: 게시중 (원하면 ""로)
      boardViewCount: 0,
      categoryNo: 1,
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
      profileImg: "",
    });
    setModalType("user");
    setModalOpen(true);
  };

  // --- 모달 저장 ---
  const saveChanges = async () => {
    // ===== 유저 =====
    if (modalType === "user") {
      const isCreate = !selectedItem.memberNo;
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

      if (isCreate) await createUser(selectedItem);
      else await editUser(selectedItem);

      setModalOpen(false);
      return;
    }

    // ===== 공지 =====
    const isCreate = !selectedItem.boardNo;

    if (!selectedItem.boardTitle?.trim() || !selectedItem.boardContent?.trim()) {
      alert("제목 또는 내용을 입력해 주세요");
      return;
    }

    if (isCreate) await createBoard(selectedItem);
    else await editBoard(selectedItem);

    setModalOpen(false);
  };

  // --- 공지 이미지 업로드(미리보기) ---
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNoticeImageFile(file);

    // ✅ blob URL로 즉시 미리보기
    const blobUrl = URL.createObjectURL(file);
    setNoticeImagePreview(blobUrl);
  };

  const moveTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // =========================
  // 렌더
  // =========================
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
              <span className="admin-name">
                {globalState.loginMember?.memberName} 관리자님
              </span>

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
        {/* =========================
            공지사항
           ========================= */}
        <section className="card-section" id="notice">
          <div className="card-header">
            <div className="header-txt">
              <h3>공지사항</h3>
              <p>사이트 전체 공지사항을 관리합니다.</p>
            </div>
            <button className="btn-blue" onClick={handleAddNotice}>
              + 새 공지사항
            </button>
          </div>

          {/*  공지 필터 + 검색  */}
          <div className="toolbar">
            <div className="tabs">
              {/* 상태 필터 */}
              <button
                className={noticeStatusFilter === "all" ? "active" : ""}
                onClick={() => {
                  setNoticeStatusFilter("all");
                  setNoticePage(1);
                }}
              >
                전체
              </button>
              <button
                className={noticeStatusFilter === "N" ? "active" : ""}
                onClick={() => {
                  setNoticeStatusFilter("N");
                  setNoticePage(1);
                }}
              >
                게시중
              </button>
              <button
                className={noticeStatusFilter === "Y" ? "active" : ""}
                onClick={() => {
                  setNoticeStatusFilter("Y");
                  setNoticePage(1);
                }}
              >
                임시저장
              </button>
              
              <hr color="black"/>

              {/* 카테고리 필터  */}
              <button
                className={noticeCategoryFilter === "all" ? "active" : ""}
                onClick={() => {
                  setNoticeCategoryFilter("all");
                  setNoticePage(1);
                }}
              >
                카테고리전체
              </button>
              <button
                className={noticeCategoryFilter === "1" ? "active" : ""}
                onClick={() => {
                  setNoticeCategoryFilter("1");
                  setNoticePage(1);
                }}
              >
                일반
              </button>
              <button
                className={noticeCategoryFilter === "2" ? "active" : ""}
                onClick={() => {
                  setNoticeCategoryFilter("2");
                  setNoticePage(1);
                }}
              >
                업데이트
              </button>
              <button
                className={noticeCategoryFilter === "3" ? "active" : ""}
                onClick={() => {
                  setNoticeCategoryFilter("3");
                  setNoticePage(1);
                }}
              >
                점검
              </button>
              <button
                className={noticeCategoryFilter === "4" ? "active" : ""}
                onClick={() => {
                  setNoticeCategoryFilter("4");
                  setNoticePage(1);
                }}
              >
                이벤트
              </button>
              <button
                className={noticeCategoryFilter === "5" ? "active" : ""}
                onClick={() => {
                  setNoticeCategoryFilter("5");
                  setNoticePage(1);
                }}
              >
                긴급
              </button>
            </div>

            {/* 제목 검색 */}
            <div className="search-box">
              <IoSearch />
              <input
                type="text"
                placeholder="공지 제목 검색..."
                value={noticeSearch}
                onChange={(e) => {
                  setNoticeSearch(e.target.value);
                  setNoticePage(1);
                }}
              />
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>조회수</th>
                <th>상태</th>
                <th>카테고리</th>
                <th>관리</th>
              </tr>
            </thead>

            <tbody>
              {displayedNotices.map((notice) => (
                <tr key={notice.boardNo}>
                  <td>{notice.boardTitle}</td>
                  <td>{notice.memberName} 님</td>
                  <td>{notice.boardWriteDate}</td>
                  <td>{notice.boardViewCount}</td>

                  {/* 상태 */}
                  <td>
                    <span
                      className={
                        notice.boardDelFl === "N" ? "badge-success" : "badge-draft"
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {notice.boardDelFl === "N" ? "게시중" : "임시저장"}
                    </span>
                  </td>


                  <td>
                    <span
                      className={`category-badge ${
                        notice.categoryName === "일반"
                          ? "badge-general"
                          : notice.categoryName === "업데이트"
                          ? "badge-update"
                          : notice.categoryName === "점검"
                          ? "badge-maintenance"
                          : notice.categoryName === "이벤트"
                          ? "badge-event"
                          : "badge-urgent"
                      }`}
                    >
                      {notice.categoryName}
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

          {/* 공지 페이지네이션 */}
          <div className="pagination">
            {/* 필터 결과 기준으로 총 개수 */}
            <span>총 {filteredNotices.length}건 표시</span>

            <div className="page-btns">
              <button
                className="p-nav"
                disabled={noticePage === 1}
                onClick={() => setNoticePage(noticePage - 1)}
              >
                <FaChevronLeft />
              </button>

              {[...Array(totalNoticePages)].map((_, i) => (
                <button
                  key={i}
                  className={noticePage === i + 1 ? "p-num active" : "p-num"}
                  onClick={() => setNoticePage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="p-nav"
                disabled={noticePage === totalNoticePages}
                onClick={() => setNoticePage(noticePage + 1)}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </section>

        {/* =========================
            유저 요약 통계
           ========================= */}
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

        {/* =========================
            유저 관리
           ========================= */}
        <section className="card-section" id="users">
          <div className="card-header">
            <div className="header-txt">
              <h3>유저 관리</h3>
              <p>등록된 사용자들을 관리하고 권한을 설정합니다.</p>
            </div>
            <div className="btn-group">
              <button className="btn-blue" onClick={handleAddUser}>
                <FaUserPlus /> 새 유저 추가
              </button>
            </div>
          </div>

          {/* 유저 필터 + 검색 */}
          <div className="toolbar">
            <div className="tabs">
              <button
                className={userFilter === "all" ? "active" : ""}
                onClick={() => {
                  setUserFilter("all");
                  setCurrentPage(1);
                }}
              >
                전체
              </button>
              <button
                className={userFilter === "active" ? "active" : ""}
                onClick={() => {
                  setUserFilter("active");
                  setCurrentPage(1);
                }}
              >
                활성
              </button>
              <button
                className={userFilter === "inactive" ? "active" : ""}
                onClick={() => {
                  setUserFilter("inactive");
                  setCurrentPage(1);
                }}
              >
                비활성
              </button>
              <button
                className={userFilter === "normal" ? "active" : ""}
                onClick={() => {
                  setUserFilter("normal");
                  setCurrentPage(1);
                }}
              >
                일반
              </button>
              <button
                className={userFilter === "admin" ? "active" : ""}
                onClick={() => {
                  setUserFilter("admin");
                  setCurrentPage(1);
                }}
              >
                관리자
              </button>
            </div>

            <div className="search-box">
              <IoSearch />
              <input
                type="text"
                placeholder="유저 검색..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
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
              {displayedUsers.map((user) => (
                <tr key={user.memberNo}>
                  <td>{user.memberName}</td>
                  <td>{user.memberEmail}</td>
                  <td>{user.authority === 3 ? "관리자" : "일반"}</td>
                  <td>{user.socialType == null ? "LOCAL" : user.socialType}</td>
                  <td>{user.enrollDate}</td>
                  <td>
                    <span
                      className={user.memberDelFl === "N" ? "dot-active" : "dot-inactive"}
                    >
                      {user.memberDelFl === "N" ? "활성" : "비활성"}
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

          {/* 유저 페이지네이션 */}
          <div className="pagination">
            <span>총 {filteredUsers.length}명 표시</span>
            <div className="page-btns">
              <button
                className="p-nav"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <FaChevronLeft />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? "p-num active" : "p-num"}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="p-nav"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </section>

        {/* =========================
            모달
           ========================= */}
        {modalOpen && selectedItem && (
          <div className="modal-backdrop">
            <div className="modal">
              {modalType === "user" ? (
                <>
                  <h3>{selectedItem.memberNo ? "유저 수정" : "새 유저 추가"}</h3>

                  <label>이름</label>
                  <input
                    value={selectedItem.memberName}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, memberName: e.target.value })
                    }
                  />

                  <label>이메일</label>
                  <input
                    value={selectedItem.memberEmail}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, memberEmail: e.target.value })
                    }
                  />

                  {!selectedItem.memberNo ? (
                    <>
                      <label>비밀번호</label>
                      <input
                        type="password"
                        value={selectedItem.memberPw || ""}
                        onChange={(e) =>
                          setSelectedItem({ ...selectedItem, memberPw: e.target.value })
                        }
                      />
                    </>
                  ) : null}

                  <label>권한</label>
                  <select
                    value={selectedItem.authority}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        authority: Number(e.target.value),
                      })
                    }
                  >
                    <option value={1}>일반</option>
                    <option value={3}>관리자</option>
                  </select>

                  <label>상태</label>
                  <select
                    value={selectedItem.memberDelFl}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, memberDelFl: e.target.value })
                    }
                  >
                    <option value="N">활성</option>
                    <option value="Y">비활성</option>
                  </select>
                </>
              ) : (
                <>
                  <h3>{selectedItem.boardNo ? "공지사항 수정" : "새 공지사항 추가"}</h3>

                  <label>제목</label>
                  <input
                    value={selectedItem.boardTitle}
                    onChange={(e) =>
                      setSelectedItem({ ...selectedItem, boardTitle: e.target.value })
                    }
                  />

                  {/* 수정일 때만 상태 변경 */}
                  {selectedItem.boardNo ? (
                    <>
                      <label>상태</label>
                      <select
                        value={selectedItem.boardDelFl}
                        onChange={(e) =>
                          setSelectedItem({ ...selectedItem, boardDelFl: e.target.value })
                        }
                      >
                        <option value="N">게시중</option>
                        <option value="Y">임시 저장</option>
                      </select>
                    </>
                  ) : null}

                  <label>카테고리</label>
                  <select
                    value={selectedItem.categoryNo}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        categoryNo: Number(e.target.value),
                      })
                    }
                  >
                    <option value={1}>일반</option>
                    <option value={2}>업데이트</option>
                    <option value={3}>점검</option>
                    <option value={4}>이벤트</option>
                    <option value={5}>긴급</option>
                  </select>

                  <label>이미지</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} />

                  {/* 미리보기 */}
                  {previewSrc && (
                    <img
                      src={previewSrc}
                      alt="미리보기"
                      style={{
                        width: "100%",
                        marginTop: "10px",
                        borderRadius: "8px",
                      }}
                    />
                  )}

                  <label>내용</label>
                  <textarea
                    value={selectedItem.boardContent}
                    onChange={(e) =>
                      setSelectedItem({
                        ...selectedItem,
                        boardContent: e.target.value,
                      })
                    }
                  />
                </>
              )}

              <div className="modal-buttons">
                <button className="btn-white" onClick={() => setModalOpen(false)}>
                  취소
                </button>
                <button className="btn-blue" onClick={saveChanges}>
                  저장
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;