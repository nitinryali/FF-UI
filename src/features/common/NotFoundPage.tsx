import { Link } from 'react-router-dom'
import { EmptyState } from '../../components/ui/EmptyState'

export function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="That route does not exist."
      action={
        <Link to="/flags" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          Back to flags
        </Link>
      }
    />
  )
}
