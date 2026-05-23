 
 import Sidebar from "./Sidebar";
 import Topbar from "./Topbar";
 
 export default   function DashboardLayout({ current,children, title, subtitle }) {
      return (
        <main className="app-shell">
          <div className="dashboard-layout d-flex h-100 w-100">
            <Sidebar current={current}/>
            <section className="flex-grow-1 p-3 p-lg-4 overflow-auto">
              <Topbar title={title} subtitle={subtitle}/>
              <div className="route-fade">
                {children}
              </div>
            </section>
          </div>
        </main>
      );
    }
