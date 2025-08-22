import { addDoc, collection, Timestamp } from "firebase/firestore";
import { useState } from "react";
import { useLoading } from "../../context/LoadingContext";
import { db } from "../../firebase";
import type { POEntry } from "../../Model/POEntry";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import { DatePicker } from "../ui/DatePicker";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import ToastMSG from "../ui/Toaster";
function SetPo() {
  const { setLoading } = useLoading();
  const [newPOForm, setNewPOForm] = useState<POEntry>({
    supplier: "",
    poNumber: "",
    poDate: Timestamp.now(),
    products: [],
  });

  const addPOItem = () => {
    setNewPOForm({
      ...newPOForm,
      products: [
        ...newPOForm.products,
        {
          name: "",
          description: "",
          color: "",
          size: "",
          quantityOrdered: 0,
          unitPrice: 0,
          deliveryDate: Timestamp.now(),
          productionStatus: "",
          cutQty: 0,
          sewingQty: 0,
          finishingQty: 0,
          packedQty: 0,
          dispatchedQty: 0,
          invoiceNumber: "",
          invoiceValue: "",
          paymentStatus: "",
          remarks: "",
        },
      ],
    });
  };

  const updatePOItem = (index: number, field: string, value: any) => {
    const updatedItems = newPOForm.products.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setNewPOForm({ ...newPOForm, products: updatedItems });
  };

  const removePOItem = (index: number) => {
    if (newPOForm.products.length > 1) {
      setNewPOForm({
        ...newPOForm,
        products: newPOForm.products.filter((_, i) => i !== index),
      });
    }
  };

  const addNewPO = async () => {
    try {
      setLoading(true);
      const payload = {
        ...newPOForm,
        createdAt: Timestamp.now(),
      };
      const ref = await addDoc(collection(db, "poManagement"), payload);
      ToastMSG("success", "successfully Create the Po");
    } catch (error) {
      console.log("🚀 ~ addNewPO ~ error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <header className="border-b px-6 py-3 nav">
        <h1 className="text-xl">Create New Purchase Order</h1>
      </header>
      <form>
        <div className="form-space  p-10">
          <div className="grid grid-cols-3 gap-4">
            <div className="form-field-space">
              <Label>Supplier</Label>
              <Input
                type="text"
                value={newPOForm?.supplier}
                onChange={(e) =>
                  setNewPOForm({ ...newPOForm, supplier: e.target.value })
                }
                placeholder="Enter supplier name"
              />
            </div>
            <div className="form-field-space">
              <Label>Po Number</Label>
              <div className="">
                <Input
                  type="text"
                  value={newPOForm?.poNumber}
                  onChange={(e) =>
                    setNewPOForm({ ...newPOForm, poNumber: e.target.value })
                  }
                  placeholder="Enter supplier name"
                />
              </div>
            </div>
            <div className="form-field-space">
              <Label>Po Date</Label>
              <DatePicker
                date={
                  newPOForm?.poDate
                    ? new Date(
                        newPOForm?.poDate.seconds * 1000 +
                          newPOForm?.poDate.nanoseconds / 1000000
                      )
                    : undefined
                }
                setDate={(date: Date) => {
                  setNewPOForm({
                    ...newPOForm,
                    poDate: Timestamp.fromDate(date),
                  });
                }}
                className={""}
              />
            </div>
          </div>
          <div className="form-space">
            <div className="flex items-center justify-between form-field-space">
              <Label>Items</Label>
              <Button type="button" onClick={addPOItem} variant="outlineBlue">
                + Add Item
              </Button>
            </div>
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="item-1"
            >
              {newPOForm.products.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={"item-" + (index + 1)}
                  className="form-space  "
                >
                  <AccordionTrigger
                    isShowBtn={true}
                    btnFn={() => removePOItem(index)}
                  >
                    item-{index + 1}
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <div className="grid sm:grid-cols-4 gap-4 ">
                      <div className="form-field-space">
                        <Label>Product Name</Label>
                        <Input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updatePOItem(index, "name", e.target.value)
                          }
                          placeholder="Enter product description"
                        />
                      </div>

                      <div className="form-field-space">
                        <Label>Color</Label>
                        <Input
                          type="text"
                          value={item.color}
                          onChange={(e) =>
                            updatePOItem(index, "color", e.target.value)
                          }
                          placeholder="Enter color"
                        />
                      </div>

                      <div className="form-field-space">
                        <Label>Size</Label>
                        <Input
                          type="text"
                          value={item.size}
                          onChange={(e) =>
                            updatePOItem(index, "size", e.target.value)
                          }
                          placeholder="Enter size"
                        />
                      </div>

                      <div className="form-field-space">
                        <Label>Quantity Ordered</Label>
                        <Input
                          type="number"
                          value={item.quantityOrdered}
                          onChange={(e) =>
                            updatePOItem(
                              index,
                              "quantityOrdered",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Enter quantity ordered"
                        />
                      </div>

                      <div className="form-field-space">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updatePOItem(
                              index,
                              "unitPrice",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Enter unit price"
                        />
                      </div>

                      <div className="form-field-space">
                        <Label>Delivery Date</Label>
                        <DatePicker
                          date={
                            item.deliveryDate
                              ? new Date(
                                  item.deliveryDate.seconds * 1000 +
                                    item.deliveryDate.nanoseconds / 1000000
                                )
                              : undefined
                          }
                          setDate={(date: Date) => {
                            updatePOItem(
                              index,
                              "deliveryDate",
                              Timestamp.fromDate(date)
                            );
                          }}
                          className={""}
                        />
                      </div>

                      <div className="form-field-space">
                        <Label>Production Status</Label>
                        <Input
                          type="text"
                          value={item.productionStatus}
                          onChange={(e) =>
                            updatePOItem(
                              index,
                              "productionStatus",
                              e.target.value
                            )
                          }
                          placeholder="Enter production status"
                        />
                      </div>

                      <div className="form-field-space">
                        <Label>Cut Qty</Label>
                        <Input
                          type="number"
                          value={item.cutQty}
                          onChange={(e) =>
                            updatePOItem(
                              index,
                              "cutQty",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Enter cut quantity"
                        />
                      </div>

                      <div className="form-field-space">
                        <Label>Sewing Qty</Label>
                        <Input
                          type="number"
                          value={item.sewingQty}
                          onChange={(e) =>
                            updatePOItem(
                              index,
                              "sewingQty",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Enter sewing quantity"
                        />
                      </div>

                      <div className="form-field-space">
                        <Label>Finishing Qty</Label>
                        <Input
                          type="number"
                          value={item.finishingQty}
                          onChange={(e) =>
                            updatePOItem(
                              index,
                              "finishingQty",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Enter finishing quantity"
                        />
                      </div>

                      <div className="form-field-space">
                        <Label>Packed Qty</Label>
                        <Input
                          type="number"
                          value={item.packedQty}
                          onChange={(e) =>
                            updatePOItem(
                              index,
                              "packedQty",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Enter packed quantity"
                        />
                      </div>

                      <div className="form-field-space">
                        <Label>Dispatched Qty</Label>
                        <Input
                          type="number"
                          value={item.dispatchedQty}
                          onChange={(e) =>
                            updatePOItem(
                              index,
                              "dispatchedQty",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Enter dispatched quantity"
                        />
                      </div>

                      <div className="form-field-space">
                        <Label>Invoice Number</Label>
                        <Input
                          type="text"
                          value={item.invoiceNumber}
                          onChange={(e) =>
                            updatePOItem(index, "invoiceNumber", e.target.value)
                          }
                          placeholder="Enter invoice number"
                        />
                      </div>

                      <div className="form-field-space">
                        <Label>Invoice Value</Label>
                        <Input
                          type="text"
                          value={item.invoiceValue}
                          onChange={(e) =>
                            updatePOItem(index, "invoiceValue", e.target.value)
                          }
                          placeholder="Enter invoice value"
                        />
                      </div>

                      <div className="form-field-space">
                        <Label>Payment Status</Label>
                        <Input
                          type="text"
                          value={item.paymentStatus}
                          onChange={(e) =>
                            updatePOItem(index, "paymentStatus", e.target.value)
                          }
                          placeholder="Enter payment status"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 ">
                      <div className="form-field-space">
                        <Label>Product Description</Label>
                        <Textarea
                          value={item.description}
                          onChange={(e) =>
                            updatePOItem(index, "description", e.target.value)
                          }
                          placeholder="Enter product description"
                        />
                      </div>
                      <div className="form-field-space">
                        <Label>Remarks</Label>
                        <Textarea
                          value={item.remarks}
                          onChange={(e) =>
                            updatePOItem(index, "remarks", e.target.value)
                          }
                          placeholder="Enter remarks"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
        <div className="flex justify-end gap-3 py-4 sticky bottom-0 px-6 bg-white dark:bg-black">
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary" onClick={addNewPO}>
            Create PO
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SetPo;
