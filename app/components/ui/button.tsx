import cn from 'classnames'

interface ButtonProps {
  onClick: () => void
  text: string
  type?: 'primary' | 'secondary' | 'danger'
  className?: string
}

const Button = ({ onClick, text, type = 'primary', className }: ButtonProps) => {
  const buttonClass = cn("px-3 py-1 rounded-sm cursor-pointer text-sm", {
    "hover:bg-sky-600 bg-sky-700": type === 'primary',
    "hover:bg-zinc-600 bg-zinc-700": type === 'secondary',
    "hover:bg-red-600 bg-red-700": type === 'danger',
  }, className)

  return (
    <button onClick={onClick} className={buttonClass}>
      {text}
    </button>
  )
}

export default Button
