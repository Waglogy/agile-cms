import { createBrowserRouter } from 'react-router-dom';
import ContentAdminDashboard from './ContentAdminDashboard';
import AddContent from './components/AddContent';
import Contents from './components/Contents';
import ViewUpdate from './components/ViewUpdate';

const router = createBrowserRouter([
  {
    path: '/content-admin',
    element: <ContentAdminDashboard />,
    children: [
      {
        path: 'add',
        element: <AddContent />,
      },
      {
        path: 'contents',
        element: <Contents />,
      },
      {
        path: 'view-update',
        element: <ViewUpdate />,
      },
    ],
  },
]);

export default router;