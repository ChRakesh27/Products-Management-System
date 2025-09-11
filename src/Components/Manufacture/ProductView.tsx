// src/components/products/ProductView.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function ProductView({ products }) {
  return (
    <div className="max-w-4xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {products.map((prod) => (
              <AccordionItem key={prod.id} value={prod.id}>
                <AccordionTrigger>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-lg">
                      {prod.name} ({prod.color}, {prod.size})
                    </span>
                    <span className="text-sm text-muted-foreground">
                      PO: {prod.poNo} | Qty: {prod.quantityOrdered}{" "}
                      {prod.unitType} | Unit ₹{prod.unitPrice} | Total ₹
                      {prod.total}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {prod.description && (
                      <p className="text-sm text-gray-600">
                        {prod.description}
                      </p>
                    )}
                    <div>
                      <h4 className="font-semibold mb-2">Raw Materials</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Unit Price</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {prod.rawMaterials.map((rm, i) => (
                            <TableRow key={rm.id}>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell>{rm.name || "-"}</TableCell>
                              <TableCell>{rm.size || "-"}</TableCell>
                              <TableCell>{rm.color || "-"}</TableCell>
                              <TableCell>{rm.quantity}</TableCell>
                              <TableCell>₹{rm.unitPrice}</TableCell>
                              <TableCell className="font-semibold">
                                ₹{rm.total}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
