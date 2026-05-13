import { useEffect } from "react";
import { useRoutes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getRoutes } from "./routes";
import { initAuthThunk } from "@/stores/slices/authSlice";
import type { AppDispatch, RootState } from "@/stores/store";

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { initialized, isAuthenticated, accessToken } = useSelector(
    (state: RootState) => state.auth,
  );
  const routing = useRoutes(getRoutes());

  useEffect(() => {
    // Nếu có accessToken trong store (từ redux-persist) nhưng chưa verify → verify
    if (accessToken && !isAuthenticated) {
      dispatch(initAuthThunk());
    }
  }, [dispatch, accessToken, isAuthenticated]);

  // Đang verify token → hiện loading
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="flex flex-col items-center gap-4">
          <span className="inline-block w-8 h-8 border-[3px] border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Đang tải...
          </p>
        </div>
      </div>
    );
  }

  return routing;
}

export default App;
