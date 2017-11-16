const fs = require('fs');
const path = require('path');

const pdfDirectory = `${__dirname}/pdf`;

function shipDate() {
  let shipDate = new Date();
  let dayOfWeek = shipDate.getDay();
  let daysToAdd = dayOfWeek >= 5 ? 3 : 1;
  shipDate.setDate(shipDate.getDate() + daysToAdd);

  return shipDate.toLocaleDateString('en-US');
}

const testOrderString = `sales_order,contact_name,company_name,address_1,address_2,postal_code,city,state,country,telephone,residential_commercial,shipping_method,bill_transportation_to,package_type,weight,special_delivery_instructions,ship_date,reference,tnt\n123456,Nathan Huesmann,,291 Coral Circle,,90245,El Segundo,CA,US,3105311935,YES,90,1,1,10,,${shipDate()},TEST ORDER,1\n`;

const testOrder = {
  sales_order: '123456',
  contact_name: 'Nathan Huesmann',
  company_name: '',
  address_1: '291 Coral Circle',
  address_2: '',
  postal_code: '90245',
  city: 'El Segundo',
  state: 'CA',
  country: 'US',
  telephone: '3105311935',
  residential_commercial: 'YES',
  shipping_method: '90',
  bill_transportation_to: '1',
  package_type: '1',
  weight: '10',
  special_delivery_instructions: '',
  ship_date: shipDate(),
  reference: 'TEST ORDER',
  tnt: 1,
};

const validOrder = {
  sales_order: '123456',
  contact_name: 'Nathan Huesmann',
  company_name: 'Chef\'d',
  address_1: '365 Ten Eyck St',
  address_2: '',
  postal_code: '11206',
  city: 'Brooklyn',
  state: 'NY',
  country: 'US',
  telephone: '3105311935',
  residential_commercial: 'YES',
  shipping_method: '90',
  bill_transportation_to: '1',
  package_type: '1',
  weight: '10',
  special_delivery_instructions: '',
  ship_date: shipDate(),
  reference: 'TEST ORDER - VALID',
  tnt: 1,
  carrier: 'LaserShip',
  offset: '-05:00'
};

const invalidOrder = {
  sales_order: '666666',
  contact_name: '',
  company_name: '',
  address_1: '',
  address_2: '291 Coral Circle',
  postal_code: '90245',
  city: 'El Segundo',
  state: 'CA',
  country: 'US',
  telephone: '3105311935',
  residential_commercial: 'YES',
  shipping_method: '90',
  bill_transportation_to: '1',
  package_type: '1',
  weight: '10',
  special_delivery_instructions: '',
  ship_date: shipDate(),
  reference: 'TEST ORDER - INVALID',
  tnt: 2,
  carrier: 'LaserShip',
};

const orderToCleanse = {
  sales_order: '654321',
  contact_name: 'Nathan Huesmann',
  company_name: '',
  address_1: '291 Coral Circle',
  address_2: 'parking lot',
  postal_code: '1234',
  city: 'El Segundo',
  state: 'CA',
  country: 'US',
  telephone: '(310) 531-1935',
  residential_commercial: 'YES',
  shipping_method: '90',
  bill_transportation_to: '1',
  package_type: '1',
  weight: '10',
  special_delivery_instructions: 'Please leave it in the middle of the parking lot',
  ship_date: shipDate(),
  reference: 'TEST ORDER - NEEDS CLEANSING',
  tnt: 2,
  carrier: 'LaserShip',
};

const orderTrackingObjects = [
  {
    order: '123456',
    tracking: 'trackingnumber1',
  },
  {
    order: '654321',
    tracking: 'trackingnumber2',
  },
];

const labelPaths = [
  '/Users/nathanhuesmann/Documents/javascripts/lasership-integration/test/pdf/temp/label-test/123456.pdf',
  '/Users/nathanhuesmann/Documents/javascripts/lasership-integration/test/pdf/temp/label-test/654321.pdf',
];

const labelObjects = [
  {
    order: '123456',
    label: '/Users/nathanhuesmann/Documents/javascripts/lasership-integration/test/pdf/temp/label-test/123456.pdf',
    tracking: '1LS7259014383328-1',
  },
  {
    order: '654321',
    label: '/Users/nathanhuesmann/Documents/javascripts/lasership-integration/test/pdf/temp/label-test/654321.pdf',
    tracking: '1LS7259014383328-2',
  },
];

const lsResponse = '{"Error":false,"ErrorMessage":"","Order":{"CustomerBranch":"CFDBRKLN","CustomerOrderNumber":"123456","OrderedFor":"Nathan Huesmann","OrderedBy":{"Name":"Chef_d","Phone":"(310) 531-1935","Email":"tech@chefd.com"},"Reference1":"TEST ORDER - VALID: 123456","Reference2":"SHIP DATE: 11\\/16\\/2017","ServiceCode":"RD","PickupType":"LaserShip","Origin":{"LocationType":"Business","CustomerClientID":"","Contact":"Purple Carrot","Organization":"Purple Carrot","Address":"365 TEN EYCK ST","Address2":"","PostalCode":"11206-1724","City":"BROOKLYN","State":"NY","Country":"US","Phone":"(857) 703-8188","PhoneExtension":"","Email":"tech@chefd.com","Payor":"","Instruction":"","Note":"","UTCExpectedReadyForPickupBy":"2017-11-16T20:00:00","UTCExpectedDeparture":"2017-11-16T22:00:00","CustomerRoute":"","CustomerSequence":"","Longitude":0,"Latitude":0,"TimeZone":"America\\/New_York","AddressQuality":0,"GeoCodeQuality":0,"LaserShipOperationArea":"QU1206","LaserShipOperationZone":"","LaserShipPricingArea":"QU1206","LaserShipPricingZone":"","LaserShipFacilityCode":"QUEN","LaserShipBranchCode":"10"},"Destination":{"LocationType":"Business","CustomerClientID":"","Contact":"Nathan Huesmann","Organization":"Chef\'d","Address":"365 TEN EYCK ST","Address2":"","PostalCode":"11206-1724","City":"BROOKLYN","State":"NY","Country":"US","Phone":"(310) 531-1935","PhoneExtension":"","Email":"","Payor":"","Instruction":"","Note":"","UTCExpectedDeliveryBy":"2017-11-18T02:00:00","CustomerRoute":"","CustomerSequence":"","Longitude":0,"Latitude":0,"TimeZone":"America\\/New_York","AddressQuality":0,"GeoCodeQuality":0,"LaserShipOperationArea":"QU1206","LaserShipOperationZone":"","LaserShipPricingArea":"QU1206","LaserShipPricingZone":"","LaserShipFacilityCode":"QUEN","LaserShipBranchCode":"10"},"Pieces":[{"ContainerType":"CustomPackaging","CustomerBarcode":"","CustomerPalletBarcode":"","Weight":10,"WeightUnit":"lbs","Width":13,"Length":13,"Height":13,"DimensionUnit":"in","Description":"Meal Kit","Reference":"","DeclaredValue":65,"DeclaredValueCurrency":"USD","SignatureType":"NotRequired","Attributes":[{"Type":"Perishable","Description":""}],"LaserShipBarcode":"1LS7259014380769-1"}],"LaserShipOrderNumber":"1LS7259014380769","Label":"JVBERi0xLjcKJeLjz9MKNiAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDEgMCBSIC9MYXN0TW9kaWZpZWQgKEQ6MjAxNzExMTYxNDM5MjUtMDUnMDAnKSAvUmVzb3VyY2VzIDIgMCBSIC9NZWRpYUJveCBbMC4wMDAwMDAgMC4wMDAwMDAgMjg4LjAwMDAwMCA0MzIuMDAwMDAwXSAvQ3JvcEJveCBbMC4wMDAwMDAgMC4wMDAwMDAgMjg4LjAwMDAwMCA0MzIuMDAwMDAwXSAvQmxlZWRCb3ggWzAuMDAwMDAwIDAuMDAwMDAwIDI4OC4wMDAwMDAgNDMyLjAwMDAwMF0gL1RyaW1Cb3ggWzAuMDAwMDAwIDAuMDAwMDAwIDI4OC4wMDAwMDAgNDMyLjAwMDAwMF0gL0FydEJveCBbMC4wMDAwMDAgMC4wMDAwMDAgMjg4LjAwMDAwMCA0MzIuMDAwMDAwXSAvQ29udGVudHMgNyAwIFIgL1JvdGF0ZSAwIC9Hcm91cCA8PCAvVHlwZSAvR3JvdXAgL1MgL1RyYW5zcGFyZW5jeSAvQ1MgL0RldmljZVJHQiA+PiAvQW5ub3RzIFsgNSAwIFIgXSAvUFogMSA+PgplbmRvYmoKNyAwIG9iago8PC9GaWx0ZXIgL0ZsYXRlRGVjb2RlIC9MZW5ndGggMzE4Mj4+IHN0cmVhbQp4nM2dW3MURxKF3\\/Ur6m0hwmq6qvLSzZtBwtxCgDS7GwTwgC0J7OBmGYe8\\/35rhtVMymghiPpAyCYQI+vTOSezs6qrkVyGcfWWTtOY7rZfv6Unz9pvh2k8+8jH7+z\\/9KmPnrzYurFI127llMvZa4vjtLvYKt\\/yi\\/3v5ekbSWhf4GTz2mn7Wqm9msdhqrp8RbIN2W2l5DA9ufLwz5N3r47SzecnJ2\\/fX32WFncvV954Xl41TYvdvbT7+Oa9dLC4fIF1Pi\\/wxv6DB\\/fuP977Ie09TjmX0bazF1kL\\/aScT320yWmwsz9JkbN319a31++dHKXjz7ImjpVHkFVAloAsMPsMZl\\/AvAqYVwHzKmBeFezVCuZVwbwqmJeAeQnYqwJmr6BHBT0q6RHsLwX7y0BdBupysCcc7AkHe8LB7B3MPu5zSicrrrW9rLg+drNAj3FN62YVkAXmVcG8BPQoYH8pWEcFszcwLwPr6GD2ceaMnax4P9TNKiBLQNbEsQrosYAeC+ixgj1RwbwqmJeAHoXUBV7bAvaEgh4N9OhgHR3sVQfzcrCOYe3YjMX+taOfVUCWgKyJY1UwrwrmVcGeqGBeCnpU0KOBugzU5WB\\/OejRwevRwf6Ks9A6WXEWdrMKyBKQNXGsAnosoMcC9kQFPVYwewE9KskCPRqYvYEe44zuZoEeHbyGHKxjnNHgs8xuVpw54HO+flYBWaRHsI4VrKOA2QuYvYAeFdRlJAvsCQfzijOn9LImjhX3mN2sArIEZIHZZzD7AuZVQI8V7IkK1rGC2QuYvYDZK5i9gtkrmL2B2RuYvYEeHayjg3k52BMOZu9faa6OvSzjWBVkxT1mN2viWArqUrCOcRZ2s8A6GpiXgXmFPdMIPu\\/oZoV75H4W6DHsmfpZBWSBHgXMXsCeUDAvI1lg9g72l4N1dLCO4f5x7D3ji9d2N2viWHFOdLMEZIF5VTAvAfMS0KOSLDAvA68hAz0a6NHBnnAwLwfzivsv8BlFN6uMIEs4VgV1xf0X+H063SwlWWBPGNirDtbRwTo66RHMPjwLGHvPTeLM6WWFM5h+loAs0GOcOd0sUhfYEwLWUcA6Kpi9groM1GVg9gb2l4H95SArzsKxk5VBVpxf3SwDWaDHOAu7WQVkgXkJWEchdYF1VDB7BfOKc7WbReoC62hgHR2so4O6NjO6ztx5YT9rc18LsARkgXlVUNdmrvazhGSBeSnYEwr2qoJ1VDB7A3UZWEcHdTmYV5yF3HkhwAJ1xbnKfU8GwAI91sKxBMxLSF1g9gJmr2DfK6jLwOwN1OVgfzno0cE6OpjXGHRxZ7X9rDyCrMKxCqirgNkXMPsKeqxg9nF\\/z31vTT9LQI8CehTQo4IeFfRoYK8aqQvM3kGPDtbRwbyczAuchXF9LJ2sTLImjlVAVpz33SwBWWD2FcxLQI8CelSwjgp6VNIjWMe4DnWzwLwMzMtBjw56dNIj2BPxHmbsZBWSZRwrzvtulnAsAfMSMK94NtTLUtCjgnVUMC8DPRro0cBeNbAnwn51As\\/vu1kZ1JVBXZu\\/xwewQI8F9BjOc\\/pZwrEE1CVgHYX0CPaEgnkpmJeSHsG+NzAvA\\/MysL8MzMvBvBzMy0GPcX3sfnYycazwjKKfJSALzKuAHgvosZAewZ6ooMe41oLPyvtZYF4KelSwJxT0aKBHA69HA3vCQY8OeozzHny+3c8ykAV6jPOe+15KgAXmVcC8KtgTFcyrgh4F1KUkC+wJI1lg9g72l4PZx7laOllxFvayCskCPYYz934W6LGCHuN+tZsF5hXnVzcLzEtBjwrqMrCOBno00KODHh3sLwev7Tijx05WPOvoZoG6wjPWfhaoq4K6Kph9BT3Gc\\/JeloJ5KZiXgboM1OUkSzhWmDnee+4bZk4\\/SzhWAXWFOdHPAj2GPWY3S0CPAmYvYF4C9r2CHhX0aGAdDfRoYPYO6grPrRw8x+xmxbkKPrfqZ4F5ZTCvAuoqoK64doDfL9rPAntCQI8CehTQo4IeFfSoYN8r2PcGZm+gRwM9OlhHJ9ehwOp+biUgC9QV9\\/fgM7B+1sSxKqirgroEzF5AjwJ6VFCXgX3voC4HdcWZUzpZ4Rl+P6uALAFZE8cqYF4FrGMBPVbQYwV7ooI9IaBHAeuooC4jWWAdHayjg9k7eA3FGT12suKM7mYVjlVAXXFf2M0Cs69gXkKyQI8KZm+gx3j\\/2MtyUJeDeTlYxzBzDHzW1M+aOFbYm\\/SzQI9hb9LPAvMSsCcE1KVgHRX0qKBHAz0a2KsG9qqB2RuYvYPZO5i9g9k7mH0447PeM9Gwl+tnGceqoMdK6po4loAeBayjgHnFtQN8ptPPAutoYB0dzMtBXXG\\/Cv79+25WuN\\/uZxWQJSALzD6D2Vcw+wrqElCXgD0hYB0V9Khgryro0cDsDdTlYPYOenSwjg5ej3HtKJ2sOL96WXEf3c0SkAXmVcC84rzvZoEeBdQlYE8ImL2CHhX0qKBHA3U5mJeTusC+j3N17GTFfXQ3q4AsAVkTxyogq4LZVzD7CmYvoEclWaBHBa9HAz0a2BMG5mVkXuD16GD2DubloMewdmjveXRYO\\/pZBWQJyJo4VgF1FVBXBbOvYH9V0KOA2QuoK6xp\\/SxQl4E9YWBPOFhHJ3WB2ccZ3f09ZSPIKiBLQNbEsQqoq4J1FJIF5qVgTyiYvYJ5hT15PwvM3sG8HNQV5xf43KqbFa9t8Gf79bNAj+FMoZ8F5iUgK84c8FlTPwvsCQN7wkGPDuqKc6L0siaOFfdM3awCsgRkgdlnMPsC6qpgHSuYfQXzEtCjgh4VrKOCeRmYV1w7ullg9gZmb2D2DmbvYPb+JR7XfzpNY7rbfv2Wnjxrvx1eAF+\\/s\\/\\/Tpz7aNNxYpGu3cloLWRyn3cXW72mzNVz+0wat2wd18fs\\/56GNgeW7v7xO1+6MaedtevSBWNJm\\/fmA\\/Gry2xc42bx22r5Waq+2pXSqupK5fMI+20rJYXpy5eDlr+\\/S4u3VZ2lxdynsTO94uXrLWu\\/ybmEa13pvvjw6\\/sfhWu7l6cp50KBr7\\/n7l8\\/fpNt\\/Hv3x+vmbN5cvsMzzueCqaVrs7qXdxzfvpYPFdyBwsnMJ3th\\/8ODe\\/cd7P6S9xynnti3dzl7k7525uXv80JmbU774s3oH01WPb282Mm1s3PhKbn9P+exPH79z8iL93zTmdRilDHku6zD2d858b2bI352vv8LpVp6a49X0iTHMdah+QQwH4VO\\/TdHnPIjOFxl99M9lpS\\/oxq1Q2XFt6fVWCT9ncvP6q62D8Am5XPwJ4fXlJ3zS62d3yGto\\/J9O61TGnNO2xLw\\/v7MaJq9jtsjKQ5nzOOqXsubBxcZaAFa1obkZdQJYyw2yS\\/s3suqZ7y9ktcGxFJGB7HUcZCwZyV51ULNcJ0LXPEids1Ygr7apbR2RXQFdbSMqbnkeAV1eB1uGT\\/Rq2zxOo5RaAdaUhzq1cUpkv1zkdCx2Lnsd8sr4F7LaPG9mmiXA42zNz1RHB3oitzm8jKvOgLA8eps6VmUG0s9ZhlnbnT4xKnLb909F6+yEzdKWxNVEJJS15V09S5kJWLunkdUbAtM2eyYxYr62ydr2DmObP4Sytk8yadcmcZVnaTu5sXWaEDbb3e9q9DOwtoivfAIDKC+PR5YbgkIUwOYhr\\/YqhE3Pgy8XXySztpgstwQyErC2\\/fS53X1logBTG44ymTvRtHMZpI2OeUJgbTg2XUWBzFo3tRE0eyV2LMvnG21T5kqM7eVDiVX+xBWwfJJQdfaJKMDyRwxNWaaMFKDdKNlyf5AJZTUPbW2alFjqSltQxqxNCGGz+rDKn5gaRVrT+jjNxCJc2oJS2oSsxMaltBsT8zwr0me2OkucndjsFattBPk8IZltDtwDbP1ffFXYVzyO\\/vjg5\\/s4U56k1Xx15JTr+TPlfP+grQPzmKVOo9u8nT93iBeOsjaHOJvnme1Gsdbv4SBrfV7Xbp\\/On2Lt7n3O48XPFr71Sdz6QYA3B76p2f7Rcb6eFrsHi\\/Rgf2d3P22nf\\/14\\/87O9dZmVXRzQndpgu0jweV6Orh952Ha+XGx23Tma9mutbnh5ytx2ZGv\\/h5DmS\\/I\\/H6uf\\/27\\/bqda3p65dc3T6+m9nZZSS+fO8\\/loqjzmF79\\/Mc5bb+fZZu\\/Ubb1Ys1nzdHWnw\\/SV4Ifvj09Ojk6TD\\/\\/Jy1uPty51dI9PT0d3v\\/y7vB4eHvy4unVtZFHX0\\/yBa3X3r7ll\\/svDH+ffgplbmRzdHJlYW0KZW5kb2JqCjEgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFsgNiAwIFIgXSAvQ291bnQgMSA+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSAvTmFtZSAvRjEgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2EtQm9sZCAvTmFtZSAvRjIgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgPj4KZW5kb2JqCjggMCBvYmoKPDwvVHlwZSAvWE9iamVjdCAvU3VidHlwZSAvSW1hZ2UgL1dpZHRoIDExNyAvSGVpZ2h0IDc4IC9Db2xvclNwYWNlIC9EZXZpY2VSR0IgL0JpdHNQZXJDb21wb25lbnQgOCAvRmlsdGVyIC9EQ1REZWNvZGUgL0xlbmd0aCAyMzI3ID4+IHN0cmVhbQr\\/2P\\/gABBKRklGAAEBAAABAAEAAP\\/+ADtDUkVBVE9SOiBnZC1qcGVnIHYxLjAgKHVzaW5nIElKRyBKUEVHIHY4MCksIHF1YWxpdHkgPSA3NQr\\/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL\\/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL\\/wAARCABOAHUDASIAAhEBAxEB\\/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL\\/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6\\/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL\\/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6\\/9oADAMBAAIRAxEAPwD3+iiigBCQqksQAOpNR\\/aYP+e0f\\/fQrnPiBf8A2HwfeAHDz4hX\\/gR5\\/QGvDK5q2I9nK1rnt5bk312k6jny622v+p9LfaYP+e0f\\/fQpySJJko6sB1wc18z17Z8N7D7F4SikYYe5dpj9Og\\/QfrRRxDqStYrMcnjgqPtPaXu7Wt\\/wTr6QkAc1x\\/j\\/AMf2XgjTlLKLjUZwfs9tnGf9pvRR+v8AL5y8QeOPEXiaZ31HUpjETxbxMUiX22jr9Tk10nhH1v8AbLUHBuYf++xR9stf+fmH\\/vsV8T0UDsfbAvLYni4hP\\/AxS\\/abf\\/nvF\\/30K+JskdKXc3qfzoCx9sfabf8A57xf99CnJNFI21JUY+gYGviXc3qfzr2n9n\\/Si93q+sODhES2jJ9SdzfyX86Ase60UUUCCiiigDzL4tX3Gnaep67pnH6D\\/wBmrzCuo+IN99u8YXYByluFhX8Bz+pNcxXk15c1Rs\\/Rcqo+xwdOPlf79R8UTTzJEgy7sFUepJr6NsraPTdLgtwQsdvCqZPoo6\\/pXiXgWw\\/tDxfYqVykLee3tt5H64r1zxlctZ+CdbuFOGSxmIPvsNdWDjo5Hg8S1r1IUl0V\\/v8A+GPljxh4hl8UeKb7VJGJSRysKn+CMcKPy\\/UmsOiiu0+aCiux+F+hWPiLx1aWeooslsqPK0THAkKjhfpnn6CvpMeDvDIAA8P6Xgf9Oif4UCufHdJX2L\\/wh\\/hr\\/oX9L\\/8AASP\\/AAo\\/4Q\\/w1\\/0L+l\\/+Akf+FAXPjuvqP4P6T\\/ZXw7sWZcSXjNcv\\/wACOF\\/8dC10P\\/CH+Gv+hf0v\\/wABI\\/8ACteGGO3gSGGNI4o1CoiDAUDoAOwpBckooooEFRzzJbW8k0hwkal2PoAMmpK5rx5ffYPB98wOHmUQr\\/wI4P6ZqZS5YtmtCk6tWNNdWkeHXdw93eTXMn35pGdvqTmoqKK8Y\\/UEklZHpfwmsMyahqLDoFgQ\\/wDjzf8Astdx4ssn1LwjrFnGu6SazlRAO7bTj9az\\/h\\/p\\/wBg8IWhIw8+Zm\\/4EeP0Arp69ahHlppH51mtb22MnLzt92h8Q0V6X8UPhve6Bqtxqum2zzaRO5kPlrn7OTyQwHRc9D+H180rY4SeyvrrTb2K8sp5ILmJtySRtgqa6z\\/hbHjcD\\/kOyf8AfmP\\/AOJrjKKAOz\\/4Wx43\\/wCg4\\/8A35j\\/APia1NG+NfivT7tGv5otRts\\/PHJEqNj2ZQMH65rziigR9o6RqlrrekWup2bFre5jEiE9RnsfcdPwq9XnfwUneb4cW6MciK4lRfpuz\\/U16JSEFFFFABXmnxZv8Qafp4P3maZh9OB\\/M16XXh\\/xFv8A7b4vuEByluqwr+Ayf1JrnxUrU\\/U9nIaPtMYpfypv9P1OUp8EXnXEcW9U3sF3McAZPUmmUV5h94z6Etta0K1torePVrAJEgRR9pToBgd6l\\/4SHRf+gvYf+BKf4187UV1\\/XH2Pmnw1Tbu6j+4+iD4g0UjB1awI\\/wCvlP8AGsO60z4f3splubfw\\/JIxyWPlZP1NeJ0U\\/rkuwv8AVql\\/z8f3Hsh0D4bAZNn4ex\\/vRf41H\\/ZHwv8A+eXhr\\/v5F\\/jXgPiDU\\/KQ2cLfOw\\/eEdh6VzFddKUpx5pKx8\\/mGGpYet7KlLmtv69j6l\\/sj4X\\/APPLw1\\/38i\\/xo\\/sj4X\\/88vDX\\/fyL\\/Gvluui8FeFLnxh4jg06FWEAIe5lA4jjHU\\/U9B7mtDhsfV2j2GmafpyRaPBbw2b\\/ALxBbgbGz\\/EMcHPrV6o7eCK1toreFAkUSBEUdFUDAFSUCFooooARjhScZ46V4dfeD\\/FF9qFzdvpUm6eVpD+8Tuc+te5UVlVpKpa56GAzGpgnJ00nfueDf8IL4m\\/6BMn\\/AH8T\\/Gj\\/AIQXxN\\/0CZP+\\/if417xRWP1OHdno\\/wCsmJ\\/lj+P+Z4P\\/AMIL4m\\/6BMn\\/AH8T\\/Gj\\/AIQXxN\\/0CZP+\\/if417xS0fU4d2H+smJ\\/lj+P+Z4N\\/wAIJ4m\\/6BMn\\/fxP8agu\\/BHiuO3doNFlklxhV8xOv\\/fVe\\/0U1hIJ7kz4jxUotKKX3\\/5nyo\\/wu8cySM76FMzMckmWPk\\/99U3\\/AIVV43\\/6AE3\\/AH9j\\/wDiq+raK6jwXJt3Z8z6L8FvFepXKrfQRabb5+aSaRXbHsqk5P1xXvfhTwlpng\\/ShY6bGcthppn+\\/K3qT\\/IdBW7RQIWikooAWikooA\\/\\/2QplbmRzdHJlYW0KZW5kb2JqCjIgMCBvYmoKPDwgL1Byb2NTZXQgWy9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUldIC9Gb250IDw8IC9GMSAzIDAgUiAvRjIgNCAwIFIgPj4gL1hPYmplY3QgPDwgL0kwIDggMCBSID4+ID4+CmVuZG9iago1IDAgb2JqCjw8L1R5cGUgL0Fubm90IC9TdWJ0eXBlIC9MaW5rIC9SZWN0IFsyLjgzNTAwMCAxLjAwMDAwMCAxOS4wMDUwMDAgMi4xNTYwMDBdIC9Db250ZW50cyAo\\/v8AaAB0AHQAcAA6AC8ALwB3AHcAdwAuAHQAYwBwAGQAZgAuAG8AcgBnKSAvUCA2IDAgUiAvTk0gKDAwMDEtMDAwMCkgL00gKEQ6MjAxNzExMTYxNDM5MjUtMDUnMDAnKSAvRiA0IC9Cb3JkZXIgWzAgMCAwXSAvQSA8PC9TIC9VUkkgL1VSSSAoaHR0cDovL3d3dy50Y3BkZi5vcmcpPj4gL0ggL0k+PgplbmRvYmoKOSAwIG9iago8PCAvVGl0bGUgKP7\\/AEwAYQBzAGUAcgBTAGgAaQBwACAATABhAGIAZQBsAHMpIC9BdXRob3IgKP7\\/AEwAYQBzAGUAcgBTAGgAaQBwACwAIABJAG4AYwAuKSAvQ3JlYXRvciAo\\/v8ATABhAHMAZQByAFMAaABpAHAAIABMAGEAYgBlAGwAcwAgAEMAcgBlAGEAdABvAHIpIC9Qcm9kdWNlciAo\\/v8AVABDAFAARABGACAANgAuADIALgAxADIAIABcKABoAHQAdABwADoALwAvAHcAdwB3AC4AdABjAHAAZABmAC4AbwByAGcAXCkpIC9DcmVhdGlvbkRhdGUgKEQ6MjAxNzExMTYxNDM5MjUtMDUnMDAnKSAvTW9kRGF0ZSAoRDoyMDE3MTExNjE0MzkyNS0wNScwMCcpIC9UcmFwcGVkIC9GYWxzZSA+PgplbmRvYmoKMTAgMCBvYmoKPDwgL1R5cGUgL01ldGFkYXRhIC9TdWJ0eXBlIC9YTUwgL0xlbmd0aCA0Mjc5ID4+IHN0cmVhbQo8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI\\/Pgo8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA0LjIuMS1jMDQzIDUyLjM3MjcyOCwgMjAwOS8wMS8xOC0xNTowODowNCI+Cgk8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgoJCTxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyI+CgkJCTxkYzpmb3JtYXQ+YXBwbGljYXRpb24vcGRmPC9kYzpmb3JtYXQ+CgkJCTxkYzp0aXRsZT4KCQkJCTxyZGY6QWx0PgoJCQkJCTxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+TGFzZXJTaGlwIExhYmVsczwvcmRmOmxpPgoJCQkJPC9yZGY6QWx0PgoJCQk8L2RjOnRpdGxlPgoJCQk8ZGM6Y3JlYXRvcj4KCQkJCTxyZGY6U2VxPgoJCQkJCTxyZGY6bGk+TGFzZXJTaGlwLCBJbmMuPC9yZGY6bGk+CgkJCQk8L3JkZjpTZXE+CgkJCTwvZGM6Y3JlYXRvcj4KCQkJPGRjOmRlc2NyaXB0aW9uPgoJCQkJPHJkZjpBbHQ+CgkJCQkJPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij48L3JkZjpsaT4KCQkJCTwvcmRmOkFsdD4KCQkJPC9kYzpkZXNjcmlwdGlvbj4KCQkJPGRjOnN1YmplY3Q+CgkJCQk8cmRmOkJhZz4KCQkJCQk8cmRmOmxpPjwvcmRmOmxpPgoJCQkJPC9yZGY6QmFnPgoJCQk8L2RjOnN1YmplY3Q+CgkJPC9yZGY6RGVzY3JpcHRpb24+CgkJPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIj4KCQkJPHhtcDpDcmVhdGVEYXRlPjIwMTctMTEtMTZUMTQ6Mzk6MjUtMDU6MDA8L3htcDpDcmVhdGVEYXRlPgoJCQk8eG1wOkNyZWF0b3JUb29sPkxhc2VyU2hpcCBMYWJlbHMgQ3JlYXRvcjwveG1wOkNyZWF0b3JUb29sPgoJCQk8eG1wOk1vZGlmeURhdGU+MjAxNy0xMS0xNlQxNDozOToyNS0wNTowMDwveG1wOk1vZGlmeURhdGU+CgkJCTx4bXA6TWV0YWRhdGFEYXRlPjIwMTctMTEtMTZUMTQ6Mzk6MjUtMDU6MDA8L3htcDpNZXRhZGF0YURhdGU+CgkJPC9yZGY6RGVzY3JpcHRpb24+CgkJPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6cGRmPSJodHRwOi8vbnMuYWRvYmUuY29tL3BkZi8xLjMvIj4KCQkJPHBkZjpLZXl3b3Jkcz48L3BkZjpLZXl3b3Jkcz4KCQkJPHBkZjpQcm9kdWNlcj5UQ1BERiA2LjIuMTIgKGh0dHA6Ly93d3cudGNwZGYub3JnKTwvcGRmOlByb2R1Y2VyPgoJCTwvcmRmOkRlc2NyaXB0aW9uPgoJCTxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIj4KCQkJPHhtcE1NOkRvY3VtZW50SUQ+dXVpZDozOTRjOTI0ZS1mMjM4LTU3YzgtZGRiOS0xODY3NjY2YmQxN2M8L3htcE1NOkRvY3VtZW50SUQ+CgkJCTx4bXBNTTpJbnN0YW5jZUlEPnV1aWQ6Mzk0YzkyNGUtZjIzOC01N2M4LWRkYjktMTg2NzY2NmJkMTdjPC94bXBNTTpJbnN0YW5jZUlEPgoJCTwvcmRmOkRlc2NyaXB0aW9uPgoJCTxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnBkZmFFeHRlbnNpb249Imh0dHA6Ly93d3cuYWlpbS5vcmcvcGRmYS9ucy9leHRlbnNpb24vIiB4bWxuczpwZGZhU2NoZW1hPSJodHRwOi8vd3d3LmFpaW0ub3JnL3BkZmEvbnMvc2NoZW1hIyIgeG1sbnM6cGRmYVByb3BlcnR5PSJodHRwOi8vd3d3LmFpaW0ub3JnL3BkZmEvbnMvcHJvcGVydHkjIj4KCQkJPHBkZmFFeHRlbnNpb246c2NoZW1hcz4KCQkJCTxyZGY6QmFnPgoJCQkJCTxyZGY6bGkgcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgoJCQkJCQk8cGRmYVNjaGVtYTpuYW1lc3BhY2VVUkk+aHR0cDovL25zLmFkb2JlLmNvbS9wZGYvMS4zLzwvcGRmYVNjaGVtYTpuYW1lc3BhY2VVUkk+CgkJCQkJCTxwZGZhU2NoZW1hOnByZWZpeD5wZGY8L3BkZmFTY2hlbWE6cHJlZml4PgoJCQkJCQk8cGRmYVNjaGVtYTpzY2hlbWE+QWRvYmUgUERGIFNjaGVtYTwvcGRmYVNjaGVtYTpzY2hlbWE+CgkJCQkJPC9yZGY6bGk+CgkJCQkJPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CgkJCQkJCTxwZGZhU2NoZW1hOm5hbWVzcGFjZVVSST5odHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vPC9wZGZhU2NoZW1hOm5hbWVzcGFjZVVSST4KCQkJCQkJPHBkZmFTY2hlbWE6cHJlZml4PnhtcE1NPC9wZGZhU2NoZW1hOnByZWZpeD4KCQkJCQkJPHBkZmFTY2hlbWE6c2NoZW1hPlhNUCBNZWRpYSBNYW5hZ2VtZW50IFNjaGVtYTwvcGRmYVNjaGVtYTpzY2hlbWE+CgkJCQkJCTxwZGZhU2NoZW1hOnByb3BlcnR5PgoJCQkJCQkJPHJkZjpTZXE+CgkJCQkJCQkJPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CgkJCQkJCQkJCTxwZGZhUHJvcGVydHk6Y2F0ZWdvcnk+aW50ZXJuYWw8L3BkZmFQcm9wZXJ0eTpjYXRlZ29yeT4KCQkJCQkJCQkJPHBkZmFQcm9wZXJ0eTpkZXNjcmlwdGlvbj5VVUlEIGJhc2VkIGlkZW50aWZpZXIgZm9yIHNwZWNpZmljIGluY2FybmF0aW9uIG9mIGEgZG9jdW1lbnQ8L3BkZmFQcm9wZXJ0eTpkZXNjcmlwdGlvbj4KCQkJCQkJCQkJPHBkZmFQcm9wZXJ0eTpuYW1lPkluc3RhbmNlSUQ8L3BkZmFQcm9wZXJ0eTpuYW1lPgoJCQkJCQkJCQk8cGRmYVByb3BlcnR5OnZhbHVlVHlwZT5VUkk8L3BkZmFQcm9wZXJ0eTp2YWx1ZVR5cGU+CgkJCQkJCQkJPC9yZGY6bGk+CgkJCQkJCQk8L3JkZjpTZXE+CgkJCQkJCTwvcGRmYVNjaGVtYTpwcm9wZXJ0eT4KCQkJCQk8L3JkZjpsaT4KCQkJCQk8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KCQkJCQkJPHBkZmFTY2hlbWE6bmFtZXNwYWNlVVJJPmh0dHA6Ly93d3cuYWlpbS5vcmcvcGRmYS9ucy9pZC88L3BkZmFTY2hlbWE6bmFtZXNwYWNlVVJJPgoJCQkJCQk8cGRmYVNjaGVtYTpwcmVmaXg+cGRmYWlkPC9wZGZhU2NoZW1hOnByZWZpeD4KCQkJCQkJPHBkZmFTY2hlbWE6c2NoZW1hPlBERi9BIElEIFNjaGVtYTwvcGRmYVNjaGVtYTpzY2hlbWE+CgkJCQkJCTxwZGZhU2NoZW1hOnByb3BlcnR5PgoJCQkJCQkJPHJkZjpTZXE+CgkJCQkJCQkJPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CgkJCQkJCQkJCTxwZGZhUHJvcGVydHk6Y2F0ZWdvcnk+aW50ZXJuYWw8L3BkZmFQcm9wZXJ0eTpjYXRlZ29yeT4KCQkJCQkJCQkJPHBkZmFQcm9wZXJ0eTpkZXNjcmlwdGlvbj5QYXJ0IG9mIFBERi9BIHN0YW5kYXJkPC9wZGZhUHJvcGVydHk6ZGVzY3JpcHRpb24+CgkJCQkJCQkJCTxwZGZhUHJvcGVydHk6bmFtZT5wYXJ0PC9wZGZhUHJvcGVydHk6bmFtZT4KCQkJCQkJCQkJPHBkZmFQcm9wZXJ0eTp2YWx1ZVR5cGU+SW50ZWdlcjwvcGRmYVByb3BlcnR5OnZhbHVlVHlwZT4KCQkJCQkJCQk8L3JkZjpsaT4KCQkJCQkJCQk8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KCQkJCQkJCQkJPHBkZmFQcm9wZXJ0eTpjYXRlZ29yeT5pbnRlcm5hbDwvcGRmYVByb3BlcnR5OmNhdGVnb3J5PgoJCQkJCQkJCQk8cGRmYVByb3BlcnR5OmRlc2NyaXB0aW9uPkFtZW5kbWVudCBvZiBQREYvQSBzdGFuZGFyZDwvcGRmYVByb3BlcnR5OmRlc2NyaXB0aW9uPgoJCQkJCQkJCQk8cGRmYVByb3BlcnR5Om5hbWU+YW1kPC9wZGZhUHJvcGVydHk6bmFtZT4KCQkJCQkJCQkJPHBkZmFQcm9wZXJ0eTp2YWx1ZVR5cGU+VGV4dDwvcGRmYVByb3BlcnR5OnZhbHVlVHlwZT4KCQkJCQkJCQk8L3JkZjpsaT4KCQkJCQkJCQk8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KCQkJCQkJCQkJPHBkZmFQcm9wZXJ0eTpjYXRlZ29yeT5pbnRlcm5hbDwvcGRmYVByb3BlcnR5OmNhdGVnb3J5PgoJCQkJCQkJCQk8cGRmYVByb3BlcnR5OmRlc2NyaXB0aW9uPkNvbmZvcm1hbmNlIGxldmVsIG9mIFBERi9BIHN0YW5kYXJkPC9wZGZhUHJvcGVydHk6ZGVzY3JpcHRpb24+CgkJCQkJCQkJCTxwZGZhUHJvcGVydHk6bmFtZT5jb25mb3JtYW5jZTwvcGRmYVByb3BlcnR5Om5hbWU+CgkJCQkJCQkJCTxwZGZhUHJvcGVydHk6dmFsdWVUeXBlPlRleHQ8L3BkZmFQcm9wZXJ0eTp2YWx1ZVR5cGU+CgkJCQkJCQkJPC9yZGY6bGk+CgkJCQkJCQk8L3JkZjpTZXE+CgkJCQkJCTwvcGRmYVNjaGVtYTpwcm9wZXJ0eT4KCQkJCQk8L3JkZjpsaT4KCQkJCTwvcmRmOkJhZz4KCQkJPC9wZGZhRXh0ZW5zaW9uOnNjaGVtYXM+CgkJPC9yZGY6RGVzY3JpcHRpb24+Cgk8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJ3Ij8+CmVuZHN0cmVhbQplbmRvYmoKMTEgMCBvYmoKPDwgL1R5cGUgL0NhdGFsb2cgL1ZlcnNpb24gLzEuNyAvUGFnZXMgMSAwIFIgL05hbWVzIDw8ID4+IC9WaWV3ZXJQcmVmZXJlbmNlcyA8PCAvRGlyZWN0aW9uIC9MMlIgPj4gL1BhZ2VMYXlvdXQgL1NpbmdsZVBhZ2UgL1BhZ2VNb2RlIC9Vc2VOb25lIC9PcGVuQWN0aW9uIFs2IDAgUiAvRml0SCBudWxsXSAvTWV0YWRhdGEgMTAgMCBSID4+CmVuZG9iagp4cmVmCjAgMTIKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAzNzM2IDAwMDAwIG4gCjAwMDAwMDY1MDUgMDAwMDAgbiAKMDAwMDAwMzc5NSAwMDAwMCBuIAowMDAwMDAzOTAxIDAwMDAwIG4gCjAwMDAwMDY2MjkgMDAwMDAgbiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwNDgzIDAwMDAwIG4gCjAwMDAwMDQwMTIgMDAwMDAgbiAKMDAwMDAwNjkwMCAwMDAwMCBuIAowMDAwMDA3MjQ4IDAwMDAwIG4gCjAwMDAwMTE2MTAgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSAxMiAvUm9vdCAxMSAwIFIgL0luZm8gOSAwIFIgL0lEIFsgPDM5NGM5MjRlZjIzODU3YzhkZGI5MTg2NzY2NmJkMTdjPiA8Mzk0YzkyNGVmMjM4NTdjOGRkYjkxODY3NjY2YmQxN2M+IF0gPj4Kc3RhcnR4cmVmCjExODE5CiUlRU9GCg=="}}';

function setupCsvs() {
  fs.writeFileSync(`${__dirname}/csv/split-by-tnt/csv-test.csv`, testOrderString);
  fs.writeFileSync(`${__dirname}/seed/csv-test.csv`, testOrderString);

  fs.createReadStream(`${__dirname}/seed/lasership-zipcodes.csv`)
    .pipe(fs.createWriteStream(`${__dirname}/csv/split-by-tnt/lasership-zipcodes/lasership-zipcodes.csv`));
}

function setupPdfs() {
  fs.mkdirSync(`${__dirname}/pdf/temp/label-test`);
  fs.createReadStream(`${__dirname}/seed/654321.pdf`)
    .pipe(fs.createWriteStream(`${__dirname}/pdf/temp/label-test/654321.pdf`));
}

function cleanUp(fileType) {
  walkSync(`${__dirname}/${fileType}`)
    .filter(file => file.endsWith(`.${fileType}`))
    .forEach(path => fs.unlinkSync(path));
}

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {

    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });

  return filelist;
}

module.exports = {
  setupCsvs,
  setupPdfs,
  cleanUp,
  testOrder,
  testOrderString,
  validOrder,
  orderTrackingObjects,
  labelPaths,
  labelObjects,
  lsResponse,
};
