const Button = ({ children, className = '', as: Component = 'button', ...props }) => {
  const sharedClassName = `inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`;

  if (Component === 'a') {
    return (
      <a className={sharedClassName} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button className={sharedClassName} {...props}>
      {children}
    </button>
  );
};

export default Button;
