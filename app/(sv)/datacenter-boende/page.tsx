import { datacenterMetadata } from '@/lib/datacenter-metadata';
import DatacenterBoende from '@/views/DatacenterBoende';

export const metadata = datacenterMetadata('sv');

export default function Page() {
  return <DatacenterBoende />;
}
