import ESLogPanel from "@/components/EsLogPanel/index";
import { ESLogContextProvider } from '@/components/EsLogPanel/context'

const Page = () => {
  return (
    <ESLogContextProvider>
      <ESLogPanel/>
    </ESLogContextProvider>
  )
}
export default Page;