import { IconCard } from './IconCard'
import { toHash } from '../utils/appRouter'

export function CategoryCard(props) {
  return <a href={toHash(`category/${props.title.split(' ')[0].toLowerCase()}`)}><IconCard {...props} variant="category" /></a>
}
