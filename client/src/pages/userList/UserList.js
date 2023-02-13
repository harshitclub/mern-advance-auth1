import React, { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";

import "./UserList.scss";
import PageMenu from "../../components/pageMenu/PageMenu";
import UserStats from "../../components/userStats/UserStats";
import Search from "../../components/search/Search";
import ChangeRole from "../../components/changeRole/ChangeRole";
import { useDispatch, useSelector } from "react-redux";
import useRedirectLoggedOutUser from "../../customHooks/useRedirectLoggedOutUser";
import { deleteUser, getUsers } from "../../redux/features/auth/authSlice";
import {
  FILTER_USERS,
  selectUsers,
} from "../../redux/features/auth/filterSlice";
import { Spinner } from "../../components/loader/Loader";
import { shortenText } from "../profile/Profile";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const UserList = () => {
  useRedirectLoggedOutUser("/login");

  const dispatch = useDispatch();

  const [search, setSearch] = useState("");

  const { users, isLoading } = useSelector((state) => state.auth);

  const filteredUsers = useSelector(selectUsers);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const removeUser = async (id) => {
    await dispatch(deleteUser(id));
    dispatch(getUsers());
  };

  const confirmDelete = (id) => {
    confirmAlert({
      title: "Delete This User",
      message: "Are you sure to do delete this user?",
      buttons: [
        {
          label: "Delete",
          onClick: () => removeUser(id),
        },
        {
          label: "Cancel",
          onClick: () => alert("Click No"),
        },
      ],
    });
  };

  useEffect(() => {
    dispatch(FILTER_USERS({ users, search }));
    console.log();
  }, [dispatch, users, search]);
  return (
    <section>
      <div className="container">
        <PageMenu />
        <UserStats />

        <div className="user-list">
          {isLoading && <Spinner />}
          <div className="table">
            <div className="--flex-between">
              <span>
                <h3>All Users</h3>
              </span>
              <span>
                <Search
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </span>
            </div>
            {/* Table */}

            {!isLoading && users.length === 0 ? (
              <p>No User Found...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>s/n</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Change Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => {
                    const { _id, name, email, role } = user;

                    return (
                      <tr key={_id}>
                        <td>{index + 1}</td>
                        <td>{shortenText(name, 8)}</td>
                        <td>{email}</td>
                        <td>{role}</td>
                        <td>
                          <ChangeRole _id={_id} email={email} />
                        </td>
                        <td>
                          <span>
                            <FaTrashAlt
                              size={20}
                              color="red"
                              onClick={() => confirmDelete(_id)}
                            />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <hr />
          </div>
          {/* <ReactPaginate
            breakLabel="..."
            nextLabel="Next"
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            pageCount={pageCount}
            previousLabel="Prev"
            renderOnZeroPageCount={null}
            containerClassName="pagination"
            pageLinkClassName="page-num"
            previousLinkClassName="page-num"
            nextLinkClassName="page-num"
            activeLinkClassName="activePage"
          /> */}
        </div>
      </div>
    </section>
  );
};

export default UserList;
