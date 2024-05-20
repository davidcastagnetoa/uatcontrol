// NotFoundPage.jsx
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const NotFoundPage = () => {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="font-sans h-screen text-center flex flex-col items-center justify-center">
        <div>
          <h1 className="next-error-h1 inline-block m-0 mr-5 pr-6 text-2xl font-medium align-top leading-[49px]">
            404
          </h1>
          <div className="inline-block pr-6">
            <h2 className="text-sm font-normal leading-[49px] m-0">Página en desarrollo.</h2>
          </div>
          <Button asChild>
            <Link to="/">Ir a inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
