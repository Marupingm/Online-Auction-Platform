const Message = ({ variant = 'info', children }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-success bg-opacity-10 text-success border-success';
      case 'error':
        return 'bg-danger bg-opacity-10 text-danger border-danger';
      case 'warning':
        return 'bg-warning bg-opacity-10 text-warning border-warning';
      case 'info':
      default:
        return 'bg-primary bg-opacity-10 text-primary border-primary';
    }
  };

  return (
    <div className={`p-4 border-l-4 rounded-md mb-4 ${getVariantClasses()}`}>
      {children}
    </div>
  );
};

export default Message; 