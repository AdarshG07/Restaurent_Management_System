const Card = ({ children, className = '' }) => {
  return <div className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 ${className}`}>{children}</div>;
};

export default Card;
