import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QueryParamsEditor from './QueryParamsEditor';
import { Card } from '@/components/ui/card';
import RequestBodyEditor from './BodyEditor';

interface KeyValueItem {
  id: string;
  key?: string;
  value?: string;
}

interface TabsComponentProps {
  onTabChange: () => void;
  queryParams: KeyValueItem[];
  onAddQueryParam: () => void;
  onQueryParamKeyChange: (id: string | number, newKey: string) => void;
  onQueryParamValueChange: (id: string | number, newValue: string) => void;
  onDeleteQueryParam: (id: string | number) => void;

  headers: KeyValueItem[];
  onAddHeader: () => void;
  onHeaderKeyChange: (id: string | number, newKey: string) => void;
  onHeaderValueChange: (id: string | number, newValue: string) => void;
  onDeleteHeader: (id: string | number) => void;

  requestBody: string;
  onBodyChange: (value: string) => void;
  bodyLanguage: 'json' | 'plaintext';

  onBodyLanguageChange: (lang: 'json' | 'plaintext') => void;
  showPrettifyButton: boolean;
  showLanguageSelector: boolean;
}

export default function TabsComponent({
  onTabChange,
  queryParams,
  onAddQueryParam,
  onQueryParamKeyChange,
  onQueryParamValueChange,
  onDeleteQueryParam,
  headers,
  onAddHeader,
  onHeaderKeyChange,
  onHeaderValueChange,
  onDeleteHeader,
  requestBody,
  onBodyChange,
  bodyLanguage,
  showPrettifyButton,
  showLanguageSelector,
  onBodyLanguageChange,
}: TabsComponentProps) {
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
          <QueryParamsEditor
            items={queryParams}
            onAddItem={onAddQueryParam}
            onItemKeyChange={onQueryParamKeyChange}
            onItemValueChange={onQueryParamValueChange}
            onDeleteItem={onDeleteQueryParam}
            addButtonLabel="Add Query"
            keyInputPlaceholder="key"
            valueInputPlaceholder="value"
          />
        </Card>
      </TabsContent>
      <TabsContent value="headers" className="w-[110%]">
        <Card className="h-auto bg-cta-secondary rounded-t-none">
          <QueryParamsEditor
            items={headers}
            onAddItem={onAddHeader}
            onItemKeyChange={onHeaderKeyChange}
            onItemValueChange={onHeaderValueChange}
            onDeleteItem={onDeleteHeader}
            addButtonLabel="Add Header"
            keyInputPlaceholder="key"
            valueInputPlaceholder="value"
          />
        </Card>
      </TabsContent>
      <TabsContent value="body" className="w-[110%] p-2">
        <Card className="border rounded-sm p-2 min-h-[230px]">
          <RequestBodyEditor
            value={requestBody}
            onChange={onBodyChange}
            language={bodyLanguage}
            readOnly={false}
            showPrettifyButton={showPrettifyButton}
            showLanguageSelector={showLanguageSelector}
            onLanguageChange={onBodyLanguageChange}
          />
        </Card>
      </TabsContent>
    </Tabs>
  );
}
