import {
  mockNextFunction,
  mockRequest,
  mockResponse,
} from "https://deno.land/x/opine_unittest_utils/mod.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.129.0/testing/asserts.ts";
import {
  assertSpyCall,
  assertSpyCallAsync,
  spy,
} from "https://deno.land/x/mock@0.13.0/mod.ts";
import { Spy } from "https://deno.land/x/mock@0.13.0/mod.ts";
import { MockCollection } from "https://deno.land/x/denomongo_unittest_utils@v0.3/mod.ts";
import {
  Filter,
  FindOptions,
  InsertDocument,
  InsertOptions,
  UpdateFilter,
  UpdateOptions,
} from "https://deno.land/x/mongo@v0.29.2/mod.ts";

import OfferController from "../../../src/routes/offer.ts";
import {
  CryptoCurrencies,
  Currencies,
  OfferTypes,
} from "../../../src/types/offer.ts";

Deno.test("Create a new offer", async () => {
    //setup opine mocks
    const mockReq = mockRequest({
    body: {
      type: OfferTypes.SELL,
      location: [0, 0],
      crypto: CryptoCurrencies.BTC,
      currency: Currencies.CAD,
    },
  });

  const sendMock = mockResponse({});
  const mockRes = mockResponse({
    setStatus: () => sendMock,
  });
  const mockNext = mockNextFunction(()=>{});

  //setup mock collection
  MockCollection.initMock({
    insertOne: async (
      doc: InsertDocument<any>,
      options?: InsertOptions | undefined,
    ): Promise<any> => {
      return true;
    }
  });

  await OfferController.createOffer(mockReq as any, mockRes as any, mockNext as any);

  assertSpyCall(mockRes.setStatus as Spy<any>, 0, { args: [201] });
  assertSpyCall(sendMock.send as Spy<any>, 0, {});
});

/*
Deno.test("Get all offers", ()=>{
    OfferController.getAllOffers();
});

Deno.test("Get offer by id", ()=>{
    OfferController.getOfferById();
});

Deno.test("Delete offer", ()=>{
    OfferController.deleteOffer();
});
*/
