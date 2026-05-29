function Loader() {
  return (
    <div className="board-loader">
      <div className="skeleton-columns">
        {[1, 2, 3].map((col) => (
          <div key={col} className="skeleton-column">
            <div className="skeleton-header" />
            {[1, 2].map((card) => (
              <div key={card} className="skeleton-card">
                <div className="skeleton-line skeleton-line--title" />
                <div className="skeleton-line skeleton-line--desc" />
                <div className="skeleton-line skeleton-line--short" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Loader;
