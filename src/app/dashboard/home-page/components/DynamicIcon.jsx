import * as icons from 'lucide-react'


const DynamicIcon = ({name,size=24,className}) => {
  const Icon = icons[name]

    if (!Icon){
        return null;
    } 

  return <Icon size={size} className={className} />
}

export default DynamicIcon
