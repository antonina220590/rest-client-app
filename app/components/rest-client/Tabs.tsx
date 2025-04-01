import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QueryParamsEditor from './QueryParamsEditor';
import { Card } from '@/components/ui/card';

interface TabsDemoProps {
  onTabChange?: () => void;
}

export default function TabsComponent({ onTabChange }: TabsDemoProps) {
  return (
    <Tabs defaultValue="query" className="w-[90%] gap-0">
      <TabsList className="grid w-full grid-cols-3 h-10 p-0 rounded-t-md rounded-b-none">
        <TabsTrigger
          value="query"
          className="rounded-t-md cursor-pointer hover:bg-accent rounded-b-none data-[state=active]:bg-cta-primary data-[state=active]:text-slate-50 data-[state=active]:shadow-inner"
          onClick={onTabChange}
        >
          Query
        </TabsTrigger>
        <TabsTrigger
          value="headers"
          className="rounded-t-md cursor-pointer hover:bg-accent rounded-b-none data-[state=active]:bg-cta-primary data-[state=active]:text-slate-50 data-[state=active]:shadow-inner"
          onClick={onTabChange}
        >
          Headers
        </TabsTrigger>
        <TabsTrigger
          value="body"
          className="rounded-t-md cursor-pointer hover:bg-accent rounded-b-none data-[state=active]:bg-cta-primary data-[state=active]:text-slate-50 data-[state=active]:shadow-inner"
          onClick={onTabChange}
        >
          Body
        </TabsTrigger>
      </TabsList>
      <TabsContent value="query" className="w-[110%]">
        <Card className="h-auto bg-cta-secondary rounded-t-none">
          <QueryParamsEditor />
        </Card>
      </TabsContent>
    </Tabs>
  );
}
