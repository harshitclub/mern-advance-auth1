import React, { useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";

import "./UserList.scss";
import PageMenu from "../../components/pageMenu/PageMenu";
import UserStats from "../../components/userStats/UserStats";
import Search from "../../components/search/Search";
import ChangeRole from "../../components/changeRole/ChangeRole";
import { useDispatch, useSelector } from "react-redux";
import useRedirectLoggedOutUser from "../../customHooks/useRedirectLoggedOutUser";
import { getUsers } from "../../redux/features/auth/authSlice";
import { Spinner } from "../../components/loader/Loader";
import { shortenText } from "../profile/Profile";

const UserList = () => {
  useRedirectLoggedOutUser("/login");

  const dispatch = useDispatch();

  const { users, isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);
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
                <Search />
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
                  {users.map((user, index) => {
                    const { id, name, email, role } = user;

                    return (
                      <tr key={id}>
                        <td>{index + 1}</td>
                        <td>{shortenText(name, 8)}</td>
                        <td>{email}</td>
                        <td>{role}</td>
                        <td>
                          <ChangeRole />
                        </td>
                        <td>
                          <span>
                            <FaTrashAlt
                              size={20}
                              color="red"
                              // onClick={() => confirmDelete(_id)}
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
