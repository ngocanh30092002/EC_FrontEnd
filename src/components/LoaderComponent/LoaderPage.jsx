import "./LoaderStyle.css";

function LoaderPage() {
    return (
        <div className={`loader-container w-full h-screen flex justify-center items-center fixed top-0 left-0 z-[9999]`}>
            <span className="loader"></span>
        </div>
    )
}

export default LoaderPage