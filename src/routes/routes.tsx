import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import Login from "../features/login/login.page";
import ErrorPage from "./error-page";
import Students from "../features/students";
import Challenges from "../features/challenges";
import Controls from "../features/controls";

export enum pageRoutes {
  ALUNOS = '/alunos',
  DESAFIOS = '/desafios',
  LOGIN = '/login'
}

export const router = createBrowserRouter([
    {
      path: "/",
      element: (<ProtectedRoute> <Controls /> </ProtectedRoute>),
    },
    {
      path: pageRoutes.ALUNOS,
      element: (<ProtectedRoute> <Students /> </ProtectedRoute>)
    },
    {
      path: pageRoutes.DESAFIOS,
      element: (<ProtectedRoute> <Challenges /> </ProtectedRoute>)
    },
    {
      path: pageRoutes.LOGIN,
      element: <Login />,
    },
    {
      path: '*',
      element: <ErrorPage />
    }
  ]);