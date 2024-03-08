import React from "react";
import { NextPage } from "next";

import "../styles/globals.css";

const NotFoundPage: NextPage = () => {
  return (
    <div>
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
};

export default NotFoundPage;
