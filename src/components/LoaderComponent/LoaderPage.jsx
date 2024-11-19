import "./LoaderStyle.css";

function LoaderPage() {
    return (
        <div className={`loader-container w-full h-screen flex justify-center items-center`}>
            <span className="loader"></span>
        </div>
    )
}

export default LoaderPage