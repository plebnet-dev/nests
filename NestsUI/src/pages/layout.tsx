import { Outlet, useNavigate } from "react-router-dom";
import Icon from "../icon";
import Header from "../element/header";

export default function Layout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export function BackLayout() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="px-4 py-6 flex gap-2 items-center text-highlight cursor-pointer" onClick={() => navigate(-1)}>
        <Icon name="chevron" />
        Back
      </div>
      <Outlet />
    </div>
  );
}
