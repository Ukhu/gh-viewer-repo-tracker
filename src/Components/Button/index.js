import './style.css';

const Button = ({
  children,
  className,
  color='black',
  type='button',
  ...props
}) => {
  return (
    <button
      className={`${className} Button Button${color}`}
      type={type}
      {...props}>
        {children}
    </button>
  )
};

export default Button;
