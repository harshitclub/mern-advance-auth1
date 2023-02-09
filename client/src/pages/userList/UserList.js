import React from "react";
import { FaTrashAlt } from "react-icons/fa";

import "./UserList.scss";
import PageMenu from "../../components/pageMenu/PageMenu";
import UserStats from "../../components/userStats/UserStats";
import Search from "../../components/search/Search";
import ChangeRole from "../../components/changeRole/ChangeRole";

const UserList = () => {
  return (
    <section>
      <div className="container">
        <PageMenu />
        <UserStats />

        <div className="user-list">
          {/* {isLoading && <Spinner />} */}
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
                <tr>
                  <td>1</td>
                  <td>Harshit</td>
                  <td>harshitclub@gmail.com</td>
                  <td>user</td>
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
              </tbody>
            </table>

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
