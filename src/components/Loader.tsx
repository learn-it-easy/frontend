const Loader = () => {
       return (
        <div className="loader-wrapper">
        <svg className="loader-spinner" viewBox="0 0 50 50">
            <circle className="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
        </svg>
    </div>
  );
};

export default Loader;