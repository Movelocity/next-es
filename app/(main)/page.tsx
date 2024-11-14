import ESLogPanel from "./ESLogPanel";
import { ESLogContextProvider } from '@/utils/context'

const Page = () => {
  return (
    <ESLogContextProvider>
      <ESLogPanel/>
    </ESLogContextProvider>
  )
}
export default Page;