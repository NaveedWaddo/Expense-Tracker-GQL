import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import TransactionPage from "./pages/TransactionPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import Header from "./components/ui/Header.jsx";
import { GET_AUTHENTICATED_USER } from "./graphql/queries/user.query.js";
import { useQuery } from "@apollo/client";
import { Toaster } from "react-hot-toast";

function App() {
  const authUser = true;
  const { loading, data, error } = useQuery(GET_AUTHENTICATED_USER);

  console.log("Loading: ", loading);

  console.log("Authenticated user data: ", data);
  console.log("Error: ", error);

  return (
    <>
      {data?.authUser && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/transaction/:id" element={<TransactionPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
