import { Link } from 'react-router-dom';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { MapPin, Phone, Mail, Clock, ArrowLeft } from 'lucide-react';
import { restaurantConfig } from '../../config/restaurant.js';

const ContactPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/menu" className="inline-flex items-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to menu
        </Link>
      </div>

      <Card className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Contact Restaurant</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">We’re here to help</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Reach out for reservations, special requests, or order support.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Restaurant Information</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-sky-600" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href={`tel:${restaurantConfig.phone}`} className="text-sky-600 hover:underline">{restaurantConfig.phone}</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-sky-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href={`mailto:${restaurantConfig.email}`} className="text-sky-600 hover:underline">{restaurantConfig.email}</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-sky-600" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p>{restaurantConfig.address}</p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurantConfig.address)}`} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-medium text-sky-600 hover:underline">
                      Get directions
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button as="a" href={`tel:${restaurantConfig.phone}`} className="px-4 py-3">Call Restaurant</Button>
              <Button as="a" href={`mailto:${restaurantConfig.email}`} className="bg-slate-700 px-4 py-3 hover:bg-slate-800">Email Restaurant</Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-sky-600" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Opening Hours</h2>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {restaurantConfig.openingHours.map((hour) => (
                  <div key={hour} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
                    {hour}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Need help?</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Our team is happy to help with table questions, menu recommendations, or special requests during your visit.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContactPage;
