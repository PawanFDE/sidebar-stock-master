import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useInventoryController } from "@/controllers/useInventoryController";
import { CheckCircle, Clock, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface PendingReplacement {
  _id: string;
  itemName: string;
  branch: string;
  itemTrackingId: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function PendingReplacementsPage() {
  const { getPendingReplacements, confirmPendingReplacement } = useInventoryController();
  const [replacements, setReplacements] = useState<PendingReplacement[]>([]);
  const [loading, setLoading] = useState(true);

  const handleConfirm = async (id: string) => {
    await confirmPendingReplacement(id);
    const data = await getPendingReplacements();
    setReplacements(data);
  };

  useEffect(() => {
    const fetchReplacements = async () => {
      setLoading(true);
      const data = await getPendingReplacements();
      setReplacements(data);
      setLoading(false);
    };
    fetchReplacements();
  }, [getPendingReplacements]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Replacements</h1>
          <p className="text-muted-foreground mt-2">
            Track items sent for replacement that are pending action.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Pending Items
          </CardTitle>
          <Badge variant="secondary" className="px-3 py-1">
            {replacements.length} Items
          </Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : replacements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="p-4 rounded-full bg-muted/50">
                <RefreshCw className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">No pending replacements</p>
                <p className="text-sm text-muted-foreground">
                  Items sent for replacement will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Reason / Note</TableHead>
                    <TableHead>Date Sent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {replacements.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell>{item.branch}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {item.itemTrackingId}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={item.reason}>
                        {item.reason.replace('Replacement Equipment - ', '')}
                      </TableCell>
                      <TableCell>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-orange-500 hover:bg-orange-600">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                          onClick={() => handleConfirm(item._id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
