/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect } from "react";
import axios from "axios";
import style from "./searchrepo-style.module.scss";

const SearchRepo = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [sortedByRepos, setSortedByRepos] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [resultsPerPage] = useState(10);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `https://api.github.com/search/users?q=${searchQuery}&per_page=${resultsPerPage}&page=${currentPage}`
      );

      const usersWithRepoCount = await Promise.all(
        response.data.items.map(async (user) => {
          const userDetails = await axios.get(user.url);
          return { ...user, public_repos: userDetails.data.public_repos };
        })
      );
      setTotalCount(response.data.total_count);
      setUsers(usersWithRepoCount);
      setSortedByRepos(null);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleUserClick = async (username) => {
    try {
      const response = await axios.get(
        `https://api.github.com/users/${username}`
      );
      setSelectedUser(response.data);
    } catch (error) {
      console.error("Error fetching :", error);
    }
  };

  const handleSortByRepos = () => {
    const sortedUsers = [...users].sort(
      (a, b) => a.public_repos - b.public_repos
    );
    setUsers(sortedByRepos ? sortedUsers.reverse() : sortedUsers);
    setSortedByRepos((prevState) => !prevState);
  };

  const renderUserDetails = () => {
    if (!selectedUser) return null;
    return (
      <div className={style.profile}>
        <img className={style.searchImage} src={selectedUser.avatar_url} />
        <h2>{selectedUser.login}</h2>
        <p>Name: {selectedUser.name}</p>
        <p>Location: {selectedUser.location}</p>
      </div>
    );
  };
  const renderUserList = () => {
    if (users.length === 0) return <p>Пользователи не найдены</p>;
    return (
      <ul>
        {users.map((user) => (
          <li className={style.users} key={user.id} onClick={() => handleUserClick(user.login)}>
            {user.login} - Репозиториев: {user.public_repos}
          </li>
        ))}
      </ul>
    );
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Пагинация c ограничением списка до 50
  const totalPages =
    totalCount > 50 ? 5 : Math.ceil(totalCount / resultsPerPage);
  const pagination = [];
  for (let i = 1; i <= totalPages; i++) {
    pagination.push(
      <button className={style.pagination} key={i} onClick={() => handlePageChange(i)}>
        {i}
      </button>
    );
  }

  return (
    <div className={style.main}>
      <h1>Поиск репозиториев Github</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Введите имя пользователя"
        />
        <button className={style.searchButton} type="submit">
          Поиск
        </button>
      </form>
      <button className={style.sortButton} onClick={handleSortByRepos}>
        Отсортировать
      </button>
      {renderUserList()}
      {renderUserDetails()}
      <div>{pagination}</div>
    </div>
  );
};

export default SearchRepo;
